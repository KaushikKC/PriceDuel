// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IPyth.sol";

contract PredictionFactory {
    enum Asset { BTC, ETH, SOL }

    // Pyth price feed IDs (replace with actual values from Pyth docs)
    bytes32 public constant BTC_FEED_ID = 0x8d8e991e3b6e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e;
    bytes32 public constant ETH_FEED_ID = 0x9d9e991e3b6e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e;
    bytes32 public constant SOL_FEED_ID = 0xad9e991e3b6e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e3b2e;

    mapping(Asset => bytes32) public priceFeedIds;
    IPyth public pyth;

    enum PoolStatus { PENDING, LIVE, FINISHED }

    struct Pool {
        Asset asset;
        uint256 stake;
        address payable player1;
        address payable player2;
        int256 prediction1;
        int256 prediction2;
        uint256 startTime;
        uint256 joinedTime;
        bool settled;
        int256 startPrice;
        PoolStatus status;
    }

    // Only one active pool per asset+stake
    mapping(Asset => mapping(uint256 => Pool)) public activePools;

    // Events
    event PoolCreated(Asset indexed asset, uint256 indexed stake, address indexed player1, int256 prediction);
    event PoolJoined(Asset indexed asset, uint256 indexed stake, address indexed player2, int256 prediction);
    event PoolSettled(Asset indexed asset, uint256 indexed stake, address winner, uint256 amount);
    event PoolRefunded(Asset indexed asset, uint256 indexed stake, address indexed player1, uint256 amount);
    event PoolStatusChanged(Asset indexed asset, uint256 indexed stake, PoolStatus status);

    constructor(address _pyth) {
        pyth = IPyth(_pyth);
        priceFeedIds[Asset.BTC] = BTC_FEED_ID;
        priceFeedIds[Asset.ETH] = ETH_FEED_ID;
        priceFeedIds[Asset.SOL] = SOL_FEED_ID;
    }

    // Create a new pool (with Pyth updateData)
    function createPool(Asset asset, uint256 stake, int256 prediction, bytes[] calldata updateData) external payable {
        require(msg.value == stake, "Incorrect ETH sent");
        Pool storage pool = activePools[asset][stake];
        require(pool.player1 == address(0) || pool.status == PoolStatus.FINISHED, "Active pool exists");
        // Update Pyth price feeds and get start price
        pyth.updatePriceFeeds{value: msg.value}(updateData);
        (int64 price, , int32 expo, ) = pyth.getPriceUnsafe(priceFeedIds[asset]);
        int256 startPrice = int256(price);
        if (expo < 0) {
            startPrice = startPrice / int256(10 ** uint32(-expo));
        }
        activePools[asset][stake] = Pool({
            asset: asset,
            stake: stake,
            player1: payable(msg.sender),
            player2: payable(address(0)),
            prediction1: prediction,
            prediction2: 0,
            startTime: block.timestamp,
            joinedTime: 0,
            settled: false,
            startPrice: startPrice,
            status: PoolStatus.PENDING
        });
        emit PoolCreated(asset, stake, msg.sender, prediction);
        emit PoolStatusChanged(asset, stake, PoolStatus.PENDING);
    }

    // Join an existing pool
    function joinPool(Asset asset, uint256 stake, int256 prediction) external payable {
        require(msg.value == stake, "Incorrect ETH sent");
        Pool storage pool = activePools[asset][stake];
        require(pool.player1 != address(0) && pool.player2 == address(0), "No joinable pool");
        require(pool.status == PoolStatus.PENDING, "Pool not pending");
        pool.player2 = payable(msg.sender);
        pool.prediction2 = prediction;
        pool.joinedTime = block.timestamp;
        pool.status = PoolStatus.LIVE;
        emit PoolJoined(asset, stake, msg.sender, prediction);
        emit PoolStatusChanged(asset, stake, PoolStatus.LIVE);
    }

    // Settle the pool (with Pyth updateData)
    function settlePool(Asset asset, uint256 stake, bytes[] calldata updateData) external payable {
        Pool storage pool = activePools[asset][stake];
        require(pool.player1 != address(0) && pool.player2 != address(0), "Pool not full");
        require(!pool.settled, "Already settled");
        require(pool.status == PoolStatus.LIVE, "Pool not live");
        require(block.timestamp >= pool.joinedTime + 5 minutes, "Too early to settle");
        // Update Pyth price feeds and get end price
        pyth.updatePriceFeeds{value: msg.value}(updateData);
        (int64 price, , int32 expo, ) = pyth.getPriceUnsafe(priceFeedIds[asset]);
        int256 endPrice = int256(price);
        if (expo < 0) {
            endPrice = endPrice / int256(10 ** uint32(-expo));
        }
        // Determine winner
        int256 diff1 = abs(pool.prediction1 - endPrice);
        int256 diff2 = abs(pool.prediction2 - endPrice);
        address payable winner = diff1 <= diff2 ? pool.player1 : pool.player2;
        pool.settled = true;
        pool.status = PoolStatus.FINISHED;
        (bool sent, ) = winner.call{value: pool.stake * 2}("");
        require(sent, "Payout failed");
        emit PoolSettled(asset, stake, winner, pool.stake * 2);
        emit PoolStatusChanged(asset, stake, PoolStatus.FINISHED);
        // Clean up: allow new pool creation
        delete activePools[asset][stake];
    }

    // Refund if no one joins in 5 minutes
    function refundPool(Asset asset, uint256 stake) external {
        Pool storage pool = activePools[asset][stake];
        require(pool.player1 == msg.sender, "Only player1 can refund");
        require(pool.player2 == address(0), "Pool already joined");
        require(!pool.settled, "Already settled");
        require(pool.status == PoolStatus.PENDING, "Pool not pending");
        require(block.timestamp >= pool.startTime + 5 minutes, "Refund not available yet");
        pool.settled = true;
        pool.status = PoolStatus.FINISHED;
        (bool sent, ) = pool.player1.call{value: pool.stake}("");
        require(sent, "Refund failed");
        emit PoolRefunded(asset, stake, pool.player1, pool.stake);
        emit PoolStatusChanged(asset, stake, PoolStatus.FINISHED);
        // Clean up: allow new pool creation
        delete activePools[asset][stake];
    }

    function abs(int256 x) internal pure returns (int256) {
        return x >= 0 ? x : -x;
    }
} 