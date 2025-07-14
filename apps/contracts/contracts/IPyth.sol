// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPyth {
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
    function getPriceUnsafe(bytes32 id) external view returns (
        int64 price,
        uint64 conf,
        int32 expo,
        uint256 publishTime
    );
} 