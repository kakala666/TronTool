// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * TRC20 标准接口
 */
interface ITRC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * 资金池合约 - 最简化版本
 * 直接使用interface调用，不用低级call
 */
contract Pool {
    address public owner;
    ITRC20 public usdt;
    
    mapping(address => bool) public authorizedStaff;
    
    event PayoutSuccess(address indexed to, uint256 amount, address indexed staff);
    event StaffAdded(address indexed staff);
    event StaffRemoved(address indexed staff);
    
    constructor(address _usdtAddress) {
        owner = msg.sender;
        usdt = ITRC20(_usdtAddress);
        authorizedStaff[msg.sender] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedStaff[msg.sender], "Not authorized");
        _;
    }
    
    function addStaff(address staff) external onlyOwner {
        require(staff != address(0), "Invalid address");
        authorizedStaff[staff] = true;
        emit StaffAdded(staff);
    }
    
    function removeStaff(address staff) external onlyOwner {
        authorizedStaff[staff] = false;
        emit StaffRemoved(staff);
    }
    
    /**
     * 核心转账功能 - 使用最标准的方式
     */
    function payout(address to, uint256 amount) external onlyAuthorized {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        // 检查余额
        uint256 balance = usdt.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        
        // 直接调用interface的transfer
        // 注意：这里不检查返回值，因为TRON USDT可能不返回
        usdt.transfer(to, amount);
        
        emit PayoutSuccess(to, amount, msg.sender);
    }
    
    function getBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
    
    function isAuthorized(address staff) external view returns (bool) {
        return authorizedStaff[staff];
    }
}
