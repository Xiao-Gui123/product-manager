# 产品管理系统

一个智能的产品管理系统，帮助用户计算产品的每日花费，让消费更加明智。

## 功能特性

✨ **核心功能**
- 📝 添加产品信息（名称、价格、购买日期）
- 📊 自动计算从今天到购买日期的天数
- 💰 智能计算每日花费金额
- 📈 统计所有产品的总计信息
- 🎨 现代化响应式UI界面

✨ **技术特性**
- 🚀 前后端分离架构
- 💾 SQLite 内存数据库（无跨实例持久化）
- 📱 响应式设计，支持移动端
- 🔄 实时数据更新
- 🛡️ 数据验证和错误处理

## 技术栈

**后端**
- Node.js + Express.js
- SQLite3 内存数据库
- CORS 跨域支持

**前端**
- 原生 HTML5 + CSS3 + JavaScript
- Font Awesome 图标库
- 现代化 CSS Grid 和 Flexbox 布局
- 渐变色彩设计

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 启动生产服务器
```bash
npm start
```

### 4. 访问应用
打开浏览器访问：http://localhost:3000

## 项目结构

```
product-manager/
├── package.json          # 项目配置和依赖
├── server.js             # Express 服务器
├── public/               # 前端静态文件
│   └── index.html        # 主页面
└── README.md             # 项目说明
```

## API 接口

### 获取所有产品
```
GET /api/products
```

### 添加新产品
```
POST /api/products
Content-Type: application/json

{
  "name": "产品名称",
  "price": 99.99,
  "purchase_date": "2024-12-31"
}
```

### 删除产品
```
DELETE /api/products/:id
```

### 获取统计信息
```
GET /api/statistics
```

## 部署指南

### Vercel 部署
1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置构建命令：`npm install`
4. 设置启动命令：`npm start`
5. 部署完成

### 传统服务器部署
1. 上传项目文件到服务器
2. 安装 Node.js 和 npm
3. 运行 `npm install` 安装依赖
4. 运行 `npm start` 启动服务
5. 配置反向代理（如 Nginx）

### Docker 部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 使用说明

1. **添加产品**：填写产品名称、价格和购买日期，点击"添加产品"按钮
2. **查看统计**：页面顶部显示产品总数、总价值、每日总花费和平均每日花费
3. **管理产品**：在产品列表中可以查看详细信息和删除产品
4. **计算逻辑**：系统自动计算从今天到购买日期的天数，并计算每日花费（价格÷天数）

## 开发说明

### 数据库结构
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    days_from_today INTEGER NOT NULL,
    daily_cost REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 环境要求
- Node.js 14.0+
- npm 6.0+

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

💡 **提示**：这是一个完整的全栈应用，包含前端界面、后端API和数据库，可以直接部署使用。