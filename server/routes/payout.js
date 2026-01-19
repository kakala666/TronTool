/**
 * 转账API路由
 */
const express = require('express');
const router = express.Router();
const tronService = require('../services/tron');
const walletService = require('../services/wallet');

/**
 * API密钥验证中间件
 */
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_SECRET) {
        return res.status(401).json({ success: false, error: '未授权' });
    }
    next();
};

/**
 * 代理转账 - 核心API
 * POST /api/proxy-payout
 * Body: { employeeAddress, targetAddress, amount }
 */
router.post('/proxy-payout', verifyApiKey, async (req, res, next) => {
    try {
        const { employeeAddress, targetAddress, amount } = req.body;

        // 验证参数
        if (!employeeAddress || !targetAddress || !amount) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：employeeAddress, targetAddress, amount'
            });
        }

        // 验证员工是否存在
        if (!walletService.isEmployee(employeeAddress)) {
            return res.status(403).json({
                success: false,
                error: '员工地址未授权'
            });
        }

        // 获取员工私钥
        const privateKey = walletService.getEmployeePrivateKey(employeeAddress);

        // 执行代理转账
        const result = await tronService.executeProxyPayout(
            employeeAddress,
            privateKey,
            targetAddress,
            parseFloat(amount)
        );

        res.json({
            success: true,
            data: {
                fromPool: result.tx1,      // A→B交易哈希
                toTarget: result.tx2,      // B→C交易哈希（客户看到的）
                employeeAddress,
                targetAddress,
                amount: parseFloat(amount)
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * 获取资金池余额
 * GET /api/balance
 */
router.get('/balance', verifyApiKey, async (req, res, next) => {
    try {
        const balance = await tronService.getPoolBalance();
        res.json({ success: true, balance });
    } catch (error) {
        next(error);
    }
});

/**
 * 检查员工是否授权
 * GET /api/check-employee/:address
 */
router.get('/check-employee/:address', verifyApiKey, async (req, res) => {
    const { address } = req.params;
    const isEmployee = walletService.isEmployee(address);
    res.json({ success: true, isEmployee });
});

/**
 * 添加员工（管理接口）
 * POST /api/admin/add-employee
 * Body: { address, privateKey, name }
 */
router.post('/admin/add-employee', verifyApiKey, async (req, res, next) => {
    try {
        const { address, privateKey, name } = req.body;

        if (!address || !privateKey) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数：address, privateKey'
            });
        }

        walletService.addEmployee(address, privateKey, name || '');

        res.json({ success: true, message: '员工已添加' });

    } catch (error) {
        next(error);
    }
});

/**
 * 员工列表（管理接口）
 * GET /api/admin/employees
 */
router.get('/admin/employees', verifyApiKey, async (req, res) => {
    const employees = walletService.listEmployees();
    res.json({ success: true, employees });
});

/**
 * 删除员工（管理接口）
 * DELETE /api/admin/employee/:address
 */
router.delete('/admin/employee/:address', verifyApiKey, async (req, res) => {
    const { address } = req.params;
    walletService.removeEmployee(address);
    res.json({ success: true, message: '员工已删除' });
});

module.exports = router;
