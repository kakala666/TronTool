// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * TRC20 接口标准
 */
interface ITRC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * 资金池合约 - 测试版本
 * 
 * 功能：
 * 1. 接收USDT作为资金池
 * 2. 允许授权地址从资金池向外转账
 * 3. 链上显示付款方为本合约地址
 */
contract Pool {
    // 合约所有者
    address public owner;
    
    // USDT合约地址
    address public usdtAddress;
    
    // 授权员工地址映射
    mapping(address => bool) public authorizedStaff;
    
    // 事件：转账成功
    event PayoutSuccess(address indexed to, uint256 amount, address indexed staff);
    
    // 事件：添加员工
    event StaffAdded(address indexed staff);
    
    // 事件：移除员工
    event StaffRemoved(address indexed staff);
    
    /**
     * 构造函数
     * @param _usdtAddress TRON链上的USDT合约地址
     */
    constructor(address _usdtAddress) {
        owner = msg.sender;
        usdtAddress = _usdtAddress;
        // 默认授权合约创建者
        authorizedStaff[msg.sender] = true;
    }
    
    /**
     * 修饰器：仅所有者
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * 修饰器：仅授权员工
     */
    modifier onlyAuthorized() {
        require(authorizedStaff[msg.sender], "Not authorized");
        _;
    }
    
    /**
     * 添加授权员工
     * @param staff 员工地址
     */
    function addStaff(address staff) external onlyOwner {
        require(staff != address(0), "Invalid address");
        authorizedStaff[staff] = true;
        emit StaffAdded(staff);
    }
    
    /**
     * 移除授权员工
     * @param staff 员工地址
     */
    function removeStaff(address staff) external onlyOwner {
        authorizedStaff[staff] = false;
        emit StaffRemoved(staff);
    }
    
    /**
     * 从资金池向外转账 (核心功能)
     * @param to 收款地址
     * @param amount 转账金额 (单位: Sun, 1 USDT = 1000000 Sun)
     */
    function payout(address to, uint256 amount) external onlyAuthorized {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        ITRC20 usdt = ITRC20(usdtAddress);
        
        // 检查合约余额
        uint256 balance = usdt.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        
        // 执行转账 - 使用safeTransfer兼容TRON USDT
        _safeTransfer(usdtAddress, to, amount);
        
        emit PayoutSuccess(to, amount, msg.sender);
    }
    
    /**
     * 安全转账方法 - 兼容测试网USDT
     * @param token 代币合约地址
     * @param to 收款地址
     * @param value 转账金额
     */
    function _safeTransfer(address token, address to, uint value) private {
        // 编码transfer(address,uint256)函数调用
        (bool success,) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        // 只检查调用是否成功，不检查返回值
        require(success, "Transfer failed");
    }
    
    /**
     * 查询资金池的USDT余额
     * @return 当前余额 (单位: Sun)
     */
    function getBalance() external view returns (uint256) {
        ITRC20 usdt = ITRC20(usdtAddress);
        return usdt.balanceOf(address(this));
    }
    
    /**
     * 检查地址是否被授权
     * @param staff 要检查的地址
     * @return 是否授权
     */
    function isAuthorized(address staff) external view returns (bool) {
        return authorizedStaff[staff];
    }
}
