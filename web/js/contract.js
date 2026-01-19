/**
 * 合约交互模块
 */

const Contract = {
    instance: null,

    /**
     * 初始化合约
     */
    async init() {
        if (!Wallet.tronWeb) {
            throw new Error('请先连接钱包');
        }

        this.instance = await Wallet.tronWeb.contract().at(CONFIG.CONTRACT_ADDRESS);
        return this.instance;
    },

    /**
     * 检查用户是否被授权
     */
    async isAuthorized(address) {
        if (!this.instance) await this.init();

        try {
            const result = await this.instance.isAuthorized(address).call();
            return result;
        } catch (error) {
            console.error('检查授权失败:', error);
            return false;
        }
    },

    /**
     * 获取资金池余额
     */
    async getBalance() {
        if (!this.instance) await this.init();

        try {
            const balance = await this.instance.getBalance().call();
            // 转换为USDT（除以1,000,000）
            return Number(balance) / 1_000_000;
        } catch (error) {
            console.error('获取余额失败:', error);
            return 0;
        }
    },

    /**
     * 获取合约Owner
     */
    async getOwner() {
        if (!this.instance) await this.init();

        try {
            const owner = await this.instance.owner().call();
            return Wallet.tronWeb.address.fromHex(owner);
        } catch (error) {
            console.error('获取Owner失败:', error);
            return null;
        }
    },

    /**
     * 执行转账
     * @param {string} to 收款地址
     * @param {number} amount USDT金额
     */
    async payout(to, amount) {
        if (!this.instance) await this.init();

        // 转换金额为Sun单位
        const amountSun = Math.floor(amount * 1_000_000);

        try {
            const tx = await this.instance.payout(to, amountSun).send({
                feeLimit: CONFIG.FEE_LIMIT,
                callValue: 0,
                shouldPollResponse: true
            });

            return tx;
        } catch (error) {
            if (error.message && error.message.includes('Confirmation declined')) {
                throw new Error('您取消了交易');
            }
            throw error;
        }
    },

    /**
     * 添加员工授权
     * @param {string} staff 员工地址
     */
    async addStaff(staff) {
        if (!this.instance) await this.init();

        try {
            const tx = await this.instance.addStaff(staff).send({
                feeLimit: CONFIG.FEE_LIMIT,
                callValue: 0,
                shouldPollResponse: true
            });

            return tx;
        } catch (error) {
            if (error.message && error.message.includes('Confirmation declined')) {
                throw new Error('您取消了交易');
            }
            throw error;
        }
    },

    /**
     * 移除员工授权
     * @param {string} staff 员工地址
     */
    async removeStaff(staff) {
        if (!this.instance) await this.init();

        try {
            const tx = await this.instance.removeStaff(staff).send({
                feeLimit: CONFIG.FEE_LIMIT,
                callValue: 0,
                shouldPollResponse: true
            });

            return tx;
        } catch (error) {
            if (error.message && error.message.includes('Confirmation declined')) {
                throw new Error('您取消了交易');
            }
            throw error;
        }
    }
};
