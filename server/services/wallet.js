/**
 * 员工钱包管理服务
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const EMPLOYEES_FILE = path.join(__dirname, '../data/employees.json');
const ALGORITHM = 'aes-256-cbc';

class WalletService {
    constructor() {
        this.employees = this.loadEmployees();
    }

    /**
     * 加载员工数据
     */
    loadEmployees() {
        try {
            if (fs.existsSync(EMPLOYEES_FILE)) {
                const data = fs.readFileSync(EMPLOYEES_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('加载员工数据失败:', error);
        }
        return {};
    }

    /**
     * 保存员工数据
     */
    saveEmployees() {
        fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(this.employees, null, 2));
    }

    /**
     * 加密私钥
     */
    encryptPrivateKey(privateKey) {
        const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    /**
     * 解密私钥
     */
    decryptPrivateKey(encryptedData) {
        const key = Buffer.from(process.env.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * 添加员工
     */
    addEmployee(address, privateKey, name = '') {
        const encryptedKey = this.encryptPrivateKey(privateKey);
        this.employees[address.toLowerCase()] = {
            address: address,
            name: name,
            encryptedPrivateKey: encryptedKey,
            createdAt: new Date().toISOString()
        };
        this.saveEmployees();
        console.log(`员工已添加: ${address}`);
    }

    /**
     * 获取员工信息
     */
    getEmployee(address) {
        return this.employees[address.toLowerCase()];
    }

    /**
     * 获取员工私钥
     */
    getEmployeePrivateKey(address) {
        const employee = this.getEmployee(address);
        if (!employee) {
            throw new Error(`员工不存在: ${address}`);
        }
        // 如果不包含冒号，说明是明文私钥
        if (!employee.encryptedPrivateKey.includes(':')) {
            return employee.encryptedPrivateKey;
        }
        return this.decryptPrivateKey(employee.encryptedPrivateKey);
    }

    /**
     * 检查员工是否存在
     */
    isEmployee(address) {
        return !!this.employees[address.toLowerCase()];
    }

    /**
     * 删除员工
     */
    removeEmployee(address) {
        delete this.employees[address.toLowerCase()];
        this.saveEmployees();
    }

    /**
     * 获取所有员工列表（不含私钥）
     */
    listEmployees() {
        return Object.values(this.employees).map(emp => ({
            address: emp.address,
            name: emp.name,
            createdAt: emp.createdAt
        }));
    }
}

module.exports = new WalletService();
