const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 数据库初始化
const db = new sqlite3.Database('./products.db');

/**
 * 初始化数据库表
 */
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            purchase_date TEXT NOT NULL,
            days_from_today INTEGER NOT NULL,
            daily_cost REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

/**
 * 计算从购买日期到今天的天数
 * @param {string} purchaseDate - 购买日期 (YYYY-MM-DD)
 * @returns {number} 天数
 */
function calculateDaysFromToday(purchaseDate) {
    const today = new Date();
    const purchase = new Date(purchaseDate);
    const timeDiff = today.getTime() - purchase.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * 计算每日花费
 * @param {number} price - 产品价格
 * @param {number} days - 天数
 * @returns {number} 每日花费
 */
function calculateDailyCost(price, days) {
    if (days <= 0) return 0;
    return price / days;
}

// API路由

/**
 * 获取所有产品
 */
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

/**
 * 添加新产品
 */
app.post('/api/products', (req, res) => {
    const { name, price, purchase_date } = req.body;
    
    if (!name || !price || !purchase_date) {
        res.status(400).json({ error: '请填写所有必需字段' });
        return;
    }
    
    const days = calculateDaysFromToday(purchase_date);
    const dailyCost = calculateDailyCost(price, days);
    
    db.run(
        'INSERT INTO products (name, price, purchase_date, days_from_today, daily_cost) VALUES (?, ?, ?, ?, ?)',
        [name, price, purchase_date, days, dailyCost],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                name,
                price,
                purchase_date,
                days_from_today: days,
                daily_cost: dailyCost
            });
        }
    );
});

/**
 * 删除产品
 */
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: '产品删除成功' });
    });
});

/**
 * 获取统计信息
 */
app.get('/api/statistics', (req, res) => {
    db.all(`
        SELECT 
            COUNT(*) as total_products,
            SUM(price) as total_price,
            SUM(daily_cost) as total_daily_cost,
            AVG(daily_cost) as avg_daily_cost
        FROM products
    `, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows[0]);
    });
});

// 提供前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
initializeDatabase();
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});