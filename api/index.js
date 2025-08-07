const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// 数据库初始化 - 连接云数据库
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * 初始化数据库表
 */
async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            purchase_date DATE NOT NULL,
            days_from_today INTEGER NOT NULL,
            daily_cost REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 添加新产品
 */
app.post('/api/products', async (req, res) => {
    const { name, price, purchase_date } = req.body;

    if (!name || !price || !purchase_date) {
        res.status(400).json({ error: '请填写所有必需字段' });
        return;
    }

    const days = calculateDaysFromToday(purchase_date);
    const dailyCost = calculateDailyCost(price, days);

    try {
        const insertResult = await pool.query(
            'INSERT INTO products (name, price, purchase_date, days_from_today, daily_cost) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [name, price, purchase_date, days, dailyCost]
        );
        res.json({
            id: insertResult.rows[0].id,
            name,
            price,
            purchase_date,
            days_from_today: days,
            daily_cost: dailyCost
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 删除产品
 */
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: '产品删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 获取统计信息
 */
app.get('/api/statistics', async (req, res) => {
    try {
        const statResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total_products,
                COALESCE(SUM(price), 0)::numeric AS total_price,
                COALESCE(SUM(daily_cost), 0)::numeric AS total_daily_cost,
                COALESCE(AVG(daily_cost), 0)::numeric AS avg_daily_cost
            FROM products
        `);
        res.json(statResult.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 提供前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 初始化数据库
initializeDatabase().catch(console.error);

module.exports = app;
