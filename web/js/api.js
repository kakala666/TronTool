/**
 * 后端API调用模块
 */

const API = {
    /**
     * 发起API请求
     */
    async request(endpoint, options = {}) {
        const url = CONFIG.API_BASE_URL + endpoint;

        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': CONFIG.API_SECRET,
            'ngrok-skip-browser-warning': 'true',  // 跳过ngrok警告页面
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || '请求失败');
        }

        return data;
    },

    /**
     * 检查员工是否已在后端授权
     */
    async checkEmployee(address) {
        try {
            const result = await this.request(`/api/check-employee/${address}`);
            return result.isEmployee;
        } catch (error) {
            console.error('检查员工失败:', error);
            return false;
        }
    },

    /**
     * 执行代理转账（A→B→C）
     * @param {string} employeeAddress 员工地址B
     * @param {string} targetAddress 目标地址C
     * @param {number} amount 金额USDT
     */
    async proxyPayout(employeeAddress, targetAddress, amount) {
        const result = await this.request('/api/proxy-payout', {
            method: 'POST',
            body: JSON.stringify({
                employeeAddress,
                targetAddress,
                amount
            })
        });

        return result.data;
    },

    /**
     * 获取资金池余额
     */
    async getBalance() {
        try {
            const result = await this.request('/api/balance');
            return result.balance;
        } catch (error) {
            console.error('获取余额失败:', error);
            return 0;
        }
    }
};
