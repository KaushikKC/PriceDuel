// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockPyth {
    int64 public price;
    int32 public expo;

    function setPrice(int64 _price, int32 _expo) external {
        price = _price;
        expo = _expo;
    }

    // Accept ETH but do nothing (do not consume ETH)
    function updatePriceFeeds(bytes[] calldata) external payable {}

    function getPriceUnsafe(bytes32) external view returns (int64, uint64, int32, uint256) {
        return (price, 0, expo, block.timestamp);
    }
}