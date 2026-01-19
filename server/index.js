/**
 * TRON代理转账后端服务
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const payoutRoutes = require('./routes/payout');

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api', payoutRoutes);

// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || '服务器内部错误'
    });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`TRON代理转账服务已启动`);
    console.log(`端口: ${PORT}`);
    console.log(`网络: ${process.env.TRON_FULL_HOST}`);
    console.log(`合约: ${process.env.POOL_CONTRACT_ADDRESS}`);
    console.log(`=============================================`);
});
