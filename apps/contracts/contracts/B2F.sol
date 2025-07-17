// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title B2F (Base to Face) - PvP Crypto Prediction Game
 * @dev A head-to-head prediction game where users stake tokens to predict crypto prices
 */
contract B2F is Ownable, ReentrancyGuard, Pausable {
    // Enums
    enum Tier { Bronze, Silver, Gold }
    enum Asset { SOL, ETH, BTC }
    enum PoolStatus { WaitingForOpponent, Active, Settled }

    // Structs
    struct Pool {
        uint256 id;
        Tier tier;
        Asset asset;
        address player1;
        address player2;
        int256 prediction1;
        int256 prediction2;
        bool prediction1Submitted;
        bool prediction2Submitted;
        uint256 stakeAmount;
        uint256 totalPot;
        uint256 createdAt;
        uint256 settleAt;
        PoolStatus status;
        address winner;
        int256 finalPrice;
    }

    struct UserStats {
        uint256 totalGames;
        uint256 wins;
        uint256 losses;
        uint256 totalStaked;
        uint256 totalWon;
    }

    // State variables
    IERC20 public immutable stakingToken;
    
    // Protocol fee (2% = 200 basis points)
    uint256 public constant PROTOCOL_FEE_BPS = 200;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Protocol fee recipient
    address public protocolFeeRecipient;
    
    // Tier stake amounts (in token decimals, assuming 6 decimals for USDT)
    mapping(Tier => uint256) public tierStakeAmounts;
    
    // Active pools: tier => asset => poolId (only one active pool per tier+asset)
    mapping(Tier => mapping(Asset => uint256)) public activePools;
    
    // All pools
    mapping(uint256 => Pool) public pools;
    uint256 public poolCounter;
    
    // User statistics
    mapping(address => UserStats) public userStats;
    
    // User's active pools
    mapping(address => uint256[]) public userActivePools;
    
    // Pool duration (5 minutes by default)
    uint256 public poolDuration = 5 minutes;
    
    // Prediction window (1 hour before settlement)
    uint256 public predictionWindow = 1 hours;
    
    // Events
    event PoolCreated(
        uint256 indexed poolId,
        Tier indexed tier,
        Asset indexed asset,
        address creator,
        uint256 stakeAmount
    );
    
    event PlayerJoined(
        uint256 indexed poolId,
        address indexed player,
        bool isPlayer1
    );
    
    event PredictionSubmitted(
        uint256 indexed poolId,
        address indexed player,
        int256 prediction
    );
    
    event PoolSettled(
        uint256 indexed poolId,
        address indexed winner,
        int256 finalPrice,
        uint256 payout,
        uint256 protocolFee
    );
    
    event ProtocolFeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    
    event PoolExpired(uint256 indexed poolId);
    
    // Custom errors
    error InvalidTier();
    error InvalidAsset();
    error InsufficientBalance();
    error InsufficientAllowance();
    error PoolNotFound();
    error PoolAlreadyExists();
    error PoolNotActive();
    error PoolFull();
    error NotPoolParticipant();
    error PredictionAlreadySubmitted();
    error PredictionWindowClosed();
    error PoolNotReadyForSettlement();
    error PoolAlreadySettled();
    error InvalidPrediction();
    error TransferFailed();
    error InvalidProtocolFeeRecipient();

    constructor(
        address _stakingToken,
        address _initialOwner,
        address _protocolFeeRecipient
    ) Ownable(_initialOwner) {
        stakingToken = IERC20(_stakingToken);
        
        if (_protocolFeeRecipient == address(0)) revert InvalidProtocolFeeRecipient();
        protocolFeeRecipient = _protocolFeeRecipient;
        
        // Initialize tier stake amounts (assuming 6 decimals for USDT)
        tierStakeAmounts[Tier.Bronze] = 50 * 1e6;  // $50
        tierStakeAmounts[Tier.Silver] = 250 * 1e6; // $250
        tierStakeAmounts[Tier.Gold] = 750 * 1e6;   // $750
    }

    /**
     * @dev Create a new prediction pool
     * @param _tier The tier of the pool (Bronze, Silver, Gold)
     * @param _asset The crypto asset to predict (SOL, ETH, BTC)
     * @param _prediction The price prediction from player 1
     */
    function createPool(
        Tier _tier,
        Asset _asset,
        int256 _prediction
    ) external nonReentrant whenNotPaused {
        if (uint256(_tier) > 2) revert InvalidTier();
        if (uint256(_asset) > 2) revert InvalidAsset();
        if (_prediction <= 0) revert InvalidPrediction();
        
        // Check if there's already an active pool for this tier+asset
        uint256 existingPoolId = activePools[_tier][_asset];
        if (existingPoolId != 0 && pools[existingPoolId].status != PoolStatus.Settled) {
            revert PoolAlreadyExists();
        }
        
        uint256 stakeAmount = tierStakeAmounts[_tier];
        
        // Check user balance and allowance
        if (stakingToken.balanceOf(msg.sender) < stakeAmount) {
            revert InsufficientBalance();
        }
        if (stakingToken.allowance(msg.sender, address(this)) < stakeAmount) {
            revert InsufficientAllowance();
        }
        
        // Transfer stake from user
        if (!stakingToken.transferFrom(msg.sender, address(this), stakeAmount)) {
            revert TransferFailed();
        }
        
        // Create new pool
        poolCounter++;
        uint256 newPoolId = poolCounter;
        
        pools[newPoolId] = Pool({
            id: newPoolId,
            tier: _tier,
            asset: _asset,
            player1: msg.sender,
            player2: address(0),
            prediction1: _prediction,
            prediction2: 0,
            prediction1Submitted: true,
            prediction2Submitted: false,
            stakeAmount: stakeAmount,
            totalPot: stakeAmount,
            createdAt: block.timestamp,
            settleAt: block.timestamp + poolDuration,
            status: PoolStatus.WaitingForOpponent,
            winner: address(0),
            finalPrice: 0
        });
        
        // Set as active pool for this tier+asset
        activePools[_tier][_asset] = newPoolId;
        
        // Add to user's active pools
        userActivePools[msg.sender].push(newPoolId);
        
        emit PoolCreated(newPoolId, _tier, _asset, msg.sender, stakeAmount);
        emit PredictionSubmitted(newPoolId, msg.sender, _prediction);
    }

    /**
     * @dev Join an existing pool as player 2
     * @param _poolId The ID of the pool to join
     * @param _prediction The price prediction from player 2
     */
    function joinPool(uint256 _poolId, int256 _prediction) external nonReentrant whenNotPaused {
        Pool storage pool = pools[_poolId];
        
        if (pool.id == 0) revert PoolNotFound();
        if (pool.status != PoolStatus.WaitingForOpponent) revert PoolNotActive();
        if (pool.player1 == msg.sender) revert NotPoolParticipant();
        if (_prediction <= 0) revert InvalidPrediction();
        
        uint256 stakeAmount = pool.stakeAmount;
        
        // Check user balance and allowance
        if (stakingToken.balanceOf(msg.sender) < stakeAmount) {
            revert InsufficientBalance();
        }
        if (stakingToken.allowance(msg.sender, address(this)) < stakeAmount) {
            revert InsufficientAllowance();
        }
        
        // Transfer stake from user
        if (!stakingToken.transferFrom(msg.sender, address(this), stakeAmount)) {
            revert TransferFailed();
        }
        
        // Update pool
        pool.player2 = msg.sender;
        pool.prediction2 = _prediction;
        pool.prediction2Submitted = true;
        pool.totalPot += stakeAmount;
        pool.status = PoolStatus.Active;
        
        // Add to user's active pools
        userActivePools[msg.sender].push(_poolId);
        
        emit PlayerJoined(_poolId, msg.sender, false);
        emit PredictionSubmitted(_poolId, msg.sender, _prediction);
    }

    /**
     * @dev Submit a prediction for a pool
     * @param _poolId The ID of the pool
     * @param _prediction The price prediction (in appropriate decimals)
     */
    function submitPrediction(
        uint256 _poolId,
        int256 _prediction
    ) external nonReentrant whenNotPaused {
        Pool storage pool = pools[_poolId];
        
        if (pool.id == 0) revert PoolNotFound();
        if (pool.status != PoolStatus.Active) revert PoolNotActive();
        if (_prediction <= 0) revert InvalidPrediction();
        
        // Check if prediction window is still open
        if (block.timestamp > pool.settleAt - predictionWindow) {
            revert PredictionWindowClosed();
        }
        
        bool isPlayer1 = pool.player1 == msg.sender;
        bool isPlayer2 = pool.player2 == msg.sender;
        
        if (!isPlayer1 && !isPlayer2) revert NotPoolParticipant();
        
        if (isPlayer1) {
            if (pool.prediction1Submitted) revert PredictionAlreadySubmitted();
            pool.prediction1 = _prediction;
            pool.prediction1Submitted = true;
        } else {
            if (pool.prediction2Submitted) revert PredictionAlreadySubmitted();
            pool.prediction2 = _prediction;
            pool.prediction2Submitted = true;
        }
        
        emit PredictionSubmitted(_poolId, msg.sender, _prediction);
    }

    /**
     * @dev Settle a pool with the final price
     * @param _poolId The ID of the pool to settle
     * @param _finalPrice The final price of the asset
     */
    function settlePool(
        uint256 _poolId,
        int256 _finalPrice
    ) external nonReentrant whenNotPaused {
        Pool storage pool = pools[_poolId];
        
        if (pool.id == 0) revert PoolNotFound();
        if (pool.status != PoolStatus.Active) revert PoolNotActive();
        if (pool.status == PoolStatus.Settled) revert PoolAlreadySettled();
        if (_finalPrice <= 0) revert InvalidPrediction();
        
        // Only allow settlement after the settle time
        if (block.timestamp < pool.settleAt) {
            revert PoolNotReadyForSettlement();
        }
        
        pool.finalPrice = _finalPrice;
        pool.status = PoolStatus.Settled;
        
        // Clear active pool mapping
        activePools[pool.tier][pool.asset] = 0;
        
        address winner;
        uint256 payout = pool.totalPot;
        
        // Determine winner based on prediction accuracy
        if (!pool.prediction1Submitted && !pool.prediction2Submitted) {
            // Both players failed to submit predictions - refund stakes
            _refundStakes(pool);
            return;
        } else if (!pool.prediction1Submitted) {
            // Player 1 didn't submit prediction, Player 2 wins
            winner = pool.player2;
        } else if (!pool.prediction2Submitted) {
            // Player 2 didn't submit prediction, Player 1 wins
            winner = pool.player1;
        } else {
            // Both submitted predictions, find closest
            int256 diff1 = _abs(pool.prediction1 - _finalPrice);
            int256 diff2 = _abs(pool.prediction2 - _finalPrice);
            
            if (diff1 < diff2) {
                winner = pool.player1;
            } else if (diff2 < diff1) {
                winner = pool.player2;
            } else {
                // Tie - refund stakes
                _refundStakes(pool);
                return;
            }
        }
        
        pool.winner = winner;
        
        // Calculate protocol fee (2% of total pot)
        uint256 protocolFee = (pool.totalPot * PROTOCOL_FEE_BPS) / BASIS_POINTS;
        uint256 winnerPayout = pool.totalPot - protocolFee;
        
        // Transfer protocol fee
        if (!stakingToken.transfer(protocolFeeRecipient, protocolFee)) {
            revert TransferFailed();
        }
        
        // Transfer winnings to winner
        if (!stakingToken.transfer(winner, winnerPayout)) {
            revert TransferFailed();
        }
        
        // Update user statistics
        _updateUserStats(pool);
        
        // Remove from active pools for both users
        _removeFromUserActivePools(pool.player1, _poolId);
        _removeFromUserActivePools(pool.player2, _poolId);
        
        emit PoolSettled(_poolId, winner, _finalPrice, winnerPayout, protocolFee);
    }

    /**
     * @dev Expire a pool that wasn't filled or settled in time
     * @param _poolId The ID of the pool to expire
     */
    function expirePool(uint256 _poolId) external nonReentrant {
        Pool storage pool = pools[_poolId];
        
        if (pool.id == 0) revert PoolNotFound();
        if (pool.status == PoolStatus.Settled) revert PoolAlreadySettled();
        if (block.timestamp <= pool.settleAt) revert PoolNotReadyForSettlement();
        
        pool.status = PoolStatus.Settled;
        
        // Clear active pool mapping
        activePools[pool.tier][pool.asset] = 0;
        
        // Refund stakes
        _refundStakes(pool);
        
        emit PoolExpired(_poolId);
    }

   /**
 * @dev Get basic pool information
 * @param _poolId The ID of the pool
 * @return id The ID of the pool
 * @return tier The tier of the pool
 * @return asset The asset of the pool
 * @return player1 The address of player 1
 * @return player2 The address of player 2
 * @return stakeAmount The stake amount of the pool
 * @return totalPot The total pot of the pool
 * @return createdAt The creation timestamp of the pool
 * @return settleAt The settlement timestamp of the pool
 * @return status The status of the pool
 * @return winner The address of the winner
 * @return finalPrice The final price of the pool
 */
    function getPoolBasic(uint256 _poolId) external view returns (
        uint256 id,
        Tier tier,
        Asset asset,
        address player1,
        address player2,
        uint256 stakeAmount,
        uint256 totalPot,
        uint256 createdAt,
        uint256 settleAt,
        PoolStatus status,
        address winner,
        int256 finalPrice
    ) {
        Pool storage pool = pools[_poolId];
        return (
            pool.id,
            pool.tier,
            pool.asset,
            pool.player1,
            pool.player2,
            pool.stakeAmount,
            pool.totalPot,
            pool.createdAt,
            pool.settleAt,
            pool.status,
            pool.winner,
            pool.finalPrice
        );
    }

    function getPoolPredictions(uint256 _poolId) external view returns (
        int256 prediction1,
        int256 prediction2,
        bool prediction1Submitted,
        bool prediction2Submitted
    ) {
        Pool storage pool = pools[_poolId];
        return (
            pool.prediction1,
            pool.prediction2,
            pool.prediction1Submitted,
            pool.prediction2Submitted
        );
    }

   /**
 * @dev Get basic user statistics
 * @param _user The address of the user
 * @return totalGames The total number of games played by the user
 * @return wins The total number of wins by the user
 * @return losses The total number of losses by the user
 * @return totalStaked The total amount staked by the user
 * @return totalWon The total amount won by the user
 */
    function getUserStatsBasic(address _user) external view returns (
        uint256 totalGames,
        uint256 wins,
        uint256 losses,
        uint256 totalStaked,
        uint256 totalWon
    ) {
        UserStats storage stats = userStats[_user];
        return (
            stats.totalGames,
            stats.wins,
            stats.losses,
            stats.totalStaked,
            stats.totalWon
        );
    }

    /**
     * @dev Get user's active pools
     * @param _user The address of the user
     * @return Array of active pool IDs
     */
    function getUserActivePools(address _user) external view returns (uint256[] memory) {
        return userActivePools[_user];
    }

    /**
     * @dev Get active pool for a specific tier and asset
     * @param _tier The tier
     * @param _asset The asset
     * @return Pool ID (0 if no active pool)
     */
    function getActivePool(Tier _tier, Asset _asset) external view returns (uint256) {
        return activePools[_tier][_asset];
    }

    // Owner functions
    function setPoolDuration(uint256 _duration) external onlyOwner {
        poolDuration = _duration;
    }

    function setPredictionWindow(uint256 _window) external onlyOwner {
        predictionWindow = _window;
    }

    function setTierStakeAmount(Tier _tier, uint256 _amount) external onlyOwner {
        tierStakeAmounts[_tier] = _amount;
    }

    function setProtocolFeeRecipient(address _newRecipient) external onlyOwner {
        if (_newRecipient == address(0)) revert InvalidProtocolFeeRecipient();
        address oldRecipient = protocolFeeRecipient;
        protocolFeeRecipient = _newRecipient;
        emit ProtocolFeeRecipientUpdated(oldRecipient, _newRecipient);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address _to, uint256 _amount) external onlyOwner {
        if (!stakingToken.transfer(_to, _amount)) {
            revert TransferFailed();
        }
    }

    // Internal functions
    function _refundStakes(Pool storage pool) internal {
        // Refund player 1
        if (pool.player1 != address(0)) {
            if (!stakingToken.transfer(pool.player1, pool.stakeAmount)) {
                revert TransferFailed();
            }
            _removeFromUserActivePools(pool.player1, pool.id);
        }
        
        // Refund player 2 if exists
        if (pool.player2 != address(0)) {
            if (!stakingToken.transfer(pool.player2, pool.stakeAmount)) {
                revert TransferFailed();
            }
            _removeFromUserActivePools(pool.player2, pool.id);
        }
    }

    function _updateUserStats(Pool storage pool) internal {
        address winner = pool.winner;
        address loser = (winner == pool.player1) ? pool.player2 : pool.player1;
        
        // Update winner stats
        userStats[winner].totalGames++;
        userStats[winner].wins++;
        userStats[winner].totalStaked += pool.stakeAmount;
        // Note: totalWon now reflects actual amount received (after protocol fee)
        uint256 protocolFee = (pool.totalPot * PROTOCOL_FEE_BPS) / BASIS_POINTS;
        userStats[winner].totalWon += (pool.totalPot - protocolFee);
        
        // Update loser stats
        userStats[loser].totalGames++;
        userStats[loser].losses++;
        userStats[loser].totalStaked += pool.stakeAmount;
    }

    function _removeFromUserActivePools(address user, uint256 poolId) internal {
        uint256[] storage userPools = userActivePools[user];
        for (uint256 i = 0; i < userPools.length; i++) {
            if (userPools[i] == poolId) {
                userPools[i] = userPools[userPools.length - 1];
                userPools.pop();
                break;
            }
        }
    }

    function _abs(int256 x) internal pure returns (int256) {
        return x >= 0 ? x : -x;
    }
}