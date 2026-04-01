// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Treasury {
    address public owner;

    event FundsReceived(address indexed from, uint256 amount);
    event KeeperFunded(address indexed keeper, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    function fundKeeper(address keeper, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success,) = keeper.call{value: amount}("");
        require(success, "Transfer failed");
        emit KeeperFunded(keeper, amount);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success,) = to.call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawn(to, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
