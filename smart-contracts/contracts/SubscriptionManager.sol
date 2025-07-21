// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/AutomationCompatibleInterface.sol";



contract SubscriptionManager is AutomationCompatibleInterface, ReentrancyGuard, Ownable {

    // Events
    event Subscribed(address indexed user, uint256 expiresAt);
    event TokensWithdrawn(address indexed user, uint256 amount);

    // Variables
    IERC20 public acceptedToken;

    address[] public subscribers; 
    uint256 public immutable subscriptionFee; 
    uint256 public immutable subscriptionPeriod;

    mapping(address => uint256) public subscriptionExpirations; 
    mapping(address => bool) public autoRenewEnabled;


    // Constructor
    constructor(address tokenAddress, uint256 _subscriptionFee, uint256 _subscriptionPeriod) Ownable(msg.sender){
        require(_subscriptionFee > 0, "Fee must be greater than 0");
        require(_subscriptionPeriod > 0, "Period must be greater than 0");
        acceptedToken = IERC20(tokenAddress);
        subscriptionFee = _subscriptionFee;
        subscriptionPeriod = _subscriptionPeriod;
    }

    // Requires prior approve() for at least "subscriptionFee" on acceptedToken
    function subscribe() external nonReentrant{
        // User need to approve the transfer
        bool success = acceptedToken.transferFrom(msg.sender, address(this), subscriptionFee);
        require(success, "Token transfer failed");

        // Subscription expiration date updated
        uint256 currentExpiration = subscriptionExpirations[msg.sender];
        uint256 currentTimestamp = block.timestamp;

        if (subscriptionExpirations[msg.sender] == 0) {
            subscribers.push(msg.sender);
        }

        if(currentExpiration > currentTimestamp){
            // Extend existing subscription
            subscriptionExpirations[msg.sender] = currentExpiration + subscriptionPeriod;
        } else {
            // Create new subscription
            subscriptionExpirations[msg.sender] = currentTimestamp + subscriptionPeriod; 
        }

        emit Subscribed(msg.sender, subscriptionExpirations[msg.sender]);
    }

    // Return true if block.timestamp < user's subscription expiry
    function isSubscribed(address user) public view returns (bool){
        return block.timestamp < subscriptionExpirations[user];
    }

    // Return the expiration timestamp of a user’s subscription
    function subscriptionExpiresAt(address user) public view returns (uint256){    
        return subscriptionExpirations[user];
    }
    
    // Return the remaining time in seconds until the user's subscription expires
    function getRemainingTime(address user) public view returns (uint256){
        uint256 expiresAt = subscriptionExpirations[user];
        if (block.timestamp >= expiresAt) return 0;
        return expiresAt - block.timestamp;
    }

    // Withdraw a specific amount of tokens from the contract to a given address
    function withdraw(address to, uint256 amount) external onlyOwner{ 
        require (to != address(0), "Cannot withdraw to zero address");
        bool success = acceptedToken.transfer(to, amount);
        require(success, "Withdraw: transfer failed");

        emit TokensWithdrawn(to, amount);
    }

    // Withdraw the entire token balance from the contract to a given address
    function withdrawAll(address to) external onlyOwner{
        require (to != address(0), "Cannot withdraw to zero address");
        uint256 balance = acceptedToken.balanceOf(address(this));
        bool success = acceptedToken.transfer(to, balance);
        require(success, "WithdrawAll: transfer failed");

        emit TokensWithdrawn(to, balance);

    }

    function setAutoRenew(bool enabled) external {
        autoRenewEnabled[msg.sender] = enabled;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint i = 0; i < subscribers.length; i++) {
            address user = subscribers[i];
            if (autoRenewEnabled[user] && block.timestamp > subscriptionExpiresAt(user)) {
                upkeepNeeded = true;
                performData = abi.encode(user);
                return (true, performData);
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        address user = abi.decode(performData, (address));
        if (autoRenewEnabled[user] && block.timestamp > subscriptionExpiresAt(user)) {
            // user must have approved enough M9 tokens before
            acceptedToken.transferFrom(user, address(this), subscriptionFee);
            subscriptionExpirations[user] = block.timestamp + subscriptionPeriod;
            emit Subscribed(user, subscriptionExpirations[user]);
        }
    }
}   
