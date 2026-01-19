/**
 * TRON付款系统配置文件
 * 
 * 使用说明：
 * 1. 测试阶段：NETWORK = 'nile'，使用测试网合约
 * 2. 正式上线：NETWORK = 'mainnet'，使用主网合约
 */

const CONFIG = {
    // ============ 测试网配置 ============
    // 你的测试网合约地址（在TronIDE部署后填入）
    CONTRACT_ADDRESS_NILE: 'T填入你的测试网合约地址',

    // ============ 主网配置 ============
    // 正式上线时填入主网合约地址
    CONTRACT_ADDRESS_MAINNET: 'T填入你的主网合约地址',

    // ============ 当前网络 ============
    // 'nile' = 测试网, 'mainnet' = 主网
    NETWORK: 'nile',

    // USDT合约地址（不需要修改）
    USDT_ADDRESS: {
        mainnet: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        nile: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'
    },

    // 区块浏览器（不需要修改）
    EXPLORER: {
        mainnet: 'https://tronscan.org',
        nile: 'https://nile.tronscan.org'
    },

    // 能量限制
    FEE_LIMIT: 100_000_000,

    // 获取当前合约地址
    get CONTRACT_ADDRESS() {
        return this.NETWORK === 'mainnet'
            ? this.CONTRACT_ADDRESS_MAINNET
            : this.CONTRACT_ADDRESS_NILE;
    },

    // 获取当前浏览器地址
    getExplorer() {
        return this.EXPLORER[this.NETWORK];
    },

    // 获取交易链接
    getTxLink(txHash) {
        return `${this.getExplorer()}/#/transaction/${txHash}`;
    }
};
