# TRON USDT 资金池付款系统

基于TRON区块链的企业级USDT付款管理系统。

## 功能特点

- ✅ 资金集中管理 - 所有USDT集中在一个合约地址
- ✅ 授权操作 - 只有白名单员工可以发起转账  
- ✅ 链上显示 - 所有转账的付款方显示为合约地址
- ✅ 移动端友好 - 支持imToken等移动钱包
- ✅ 自动授权检测 - 网页自动判断用户权限

## 项目结构

```
├── contracts/
│   └── Pool.sol              # 智能合约
├── web/
│   ├── index.html            # 员工操作页面
│   ├── admin.html            # 管理员后台
│   └── js/
│       ├── config.js         # 配置文件
│       ├── wallet.js         # 钱包连接
│       └── contract.js       # 合约交互
├── docs/
│   ├── 部署指南.md
│   ├── 员工操作手册.md
│   └── 管理员手册.md
└── README.md
```

## 快速开始

### 1. 部署合约

1. 打开 [TronIDE](https://www.tronide.io/)
2. 复制 `contracts/Pool.sol` 代码
3. 编译并部署，参数填入主网USDT地址：
   ```
   "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
   ```
4. 记录合约地址

### 2. 配置Web

编辑 `web/js/config.js`：

```javascript
const CONFIG = {
  CONTRACT_ADDRESS: 'T你的合约地址',
  NETWORK: 'mainnet',
  // ...
};
```

### 3. 部署Web

将 `web` 目录部署到HTTPS服务器：
- GitHub Pages（推荐）
- Vercel / Netlify
- 自有服务器 + SSL

### 4. 初始化

1. 给合约充值USDT
2. 使用admin.html添加员工授权
3. 员工使用index.html进行转账

## 技术栈

- **智能合约**: Solidity ^0.8.6
- **前端**: HTML + TailwindCSS + Vanilla JS
- **钱包**: TronLink / imToken

## 网络配置

| 网络 | USDT地址 |
|-----|---------|
| 主网 | TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t |
| 测试网(Nile) | TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf |

## License

MIT
