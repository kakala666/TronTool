/**
 * TRON区块链交互服务
 */
const TronWeb = require('tronweb');

// 合约ABI（只包含需要的方法）
const POOL_ABI = [
    {
        "inputs": [{ "name": "employee", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "transferToEmployee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const USDT_ABI = [
    {
        "inputs": [{ "name": "to", "type": "address" }, { "name": "value", "type": "uint256" }],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "who", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

class TronService {
    constructor() {
        // Owner的TronWeb实例（用于调用合约transferToEmployee）
        this.ownerTronWeb = new TronWeb({
            fullHost: process.env.TRON_FULL_HOST,
            privateKey: process.env.OWNER_PRIVATE_KEY
        });

        this.poolAddress = process.env.POOL_CONTRACT_ADDRESS;
        this.usdtAddress = process.env.USDT_CONTRACT_ADDRESS;
    }

    /**
     * 创建员工的TronWeb实例
     */
    createEmployeeTronWeb(privateKey) {
        return new TronWeb({
            fullHost: process.env.TRON_FULL_HOST,
            privateKey: privateKey
        });
    }

    /**
     * 步骤1：合约A转USDT给员工B
     */
    async transferFromPoolToEmployee(employeeAddress, amount) {
        console.log(`[A→B] 开始: 合约 → ${employeeAddress}, 金额: ${amount}`);
        console.log(`[A→B] 合约地址: ${this.poolAddress}`);
        console.log(`[A→B] Owner地址: ${this.ownerTronWeb.defaultAddress.base58}`);

        try {
            const contract = await this.ownerTronWeb.contract(POOL_ABI, this.poolAddress);

            // 金额转换为Sun（USDT是6位小数）
            const amountSun = Math.floor(amount * 1_000_000);
            console.log(`[A→B] 金额Sun: ${amountSun}`);

            const tx = await contract.transferToEmployee(employeeAddress, amountSun).send({
                feeLimit: 100_000_000,
                callValue: 0
            });

            console.log(`[A→B] 完成: txHash=${tx}`);
            return tx;
        } catch (error) {
            console.error(`[A→B] 错误:`, error.message || error);
            throw error;
        }
    }

    /**
     * 步骤2：用员工B私钥签名，B转USDT给C
     */
    async transferFromEmployeeToTarget(employeePrivateKey, targetAddress, amount) {
        const employeeTronWeb = this.createEmployeeTronWeb(employeePrivateKey);
        const employeeAddress = employeeTronWeb.address.fromPrivateKey(employeePrivateKey);

        console.log(`[B→C] 开始: ${employeeAddress} → ${targetAddress}, 金额: ${amount}`);

        const usdtContract = await employeeTronWeb.contract(USDT_ABI, this.usdtAddress);

        // 金额转换为Sun
        const amountSun = Math.floor(amount * 1_000_000);

        const tx = await usdtContract.transfer(targetAddress, amountSun).send({
            feeLimit: 100_000_000,
            callValue: 0
        });

        console.log(`[B→C] 完成: txHash=${tx}`);
        return tx;
    }

    /**
     * 执行完整的代理转账流程：A→B→C
     */
    async executeProxyPayout(employeeAddress, employeePrivateKey, targetAddress, amount) {
        console.log('========================================');
        console.log(`代理转账开始`);
        console.log(`员工B: ${employeeAddress}`);
        console.log(`目标C: ${targetAddress}`);
        console.log(`金额: ${amount} USDT`);
        console.log('========================================');

        // 步骤1：A→B
        const tx1 = await this.transferFromPoolToEmployee(employeeAddress, amount);

        // 等待1秒确保交易上链
        await this.sleep(1000);

        // 步骤2：B→C
        const tx2 = await this.transferFromEmployeeToTarget(employeePrivateKey, targetAddress, amount);

        console.log('========================================');
        console.log(`代理转账完成`);
        console.log(`A→B txHash: ${tx1}`);
        console.log(`B→C txHash: ${tx2}`);
        console.log('========================================');

        return { tx1, tx2 };
    }

    /**
     * 获取资金池余额
     */
    async getPoolBalance() {
        const contract = await this.ownerTronWeb.contract(POOL_ABI, this.poolAddress);
        const balance = await contract.getBalance().call();
        return Number(balance) / 1_000_000;
    }

    /**
     * 等待
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new TronService();
