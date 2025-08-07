const app = require('./api/index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
