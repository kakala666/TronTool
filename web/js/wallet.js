/**
 * 钱包连接模块 - 兼容TronLink和imToken
 */

const Wallet = {
    tronWeb: null,
    address: null,

    /**
     * 检测钱包类型
     */
    detectWallet() {
        if (window.tronLink) return 'TronLink';
        if (window.tronWeb) return 'imToken';
        return null;
    },

    /**
     * 等待TronWeb就绪
     */
    async waitForTronWeb(timeout = 10000) {
        return new Promise((resolve, reject) => {
            // 已就绪
            if (window.tronWeb && window.tronWeb.ready) {
                this.tronWeb = window.tronWeb;
                return resolve(window.tronWeb);
            }

            // 轮询检查
            let elapsed = 0;
            const interval = setInterval(() => {
                if (window.tronWeb && window.tronWeb.ready) {
                    clearInterval(interval);
                    this.tronWeb = window.tronWeb;
                    resolve(window.tronWeb);
                }

                elapsed += 100;
                if (elapsed >= timeout) {
                    clearInterval(interval);
                    reject(new Error('请在TronLink或imToken钱包中打开此页面'));
                }
            }, 100);
        });
    },

    /**
     * 连接钱包
     */
    async connect() {
        try {
            await this.waitForTronWeb();
            this.address = this.tronWeb.defaultAddress.base58;

            if (!this.address) {
                throw new Error('请先解锁钱包');
            }

            return this.address;
        } catch (error) {
            throw error;
        }
    },

    /**
     * 获取钱包地址
     */
    getAddress() {
        return this.address;
    },

    /**
     * 格式化地址显示
     */
    formatAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    },

    /**
     * 验证地址格式
     */
    isValidAddress(address) {
        if (!address) return false;
        return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
    }
};
