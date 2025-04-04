const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// 设置静态文件目录
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// 创建数据库连接
const db = new sqlite3.Database('game.db');

// 创建用户表
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, score INTEGER)");

// 用户登录
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            res.status(500).send("服务器错误");
        } else if (row) {
            res.json({ success: true, userId: row.id, score: row.score });
        } else {
            res.json({ success: false, message: "用户名或密码错误" });
        }
    });
});

// 用户注册
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run("INSERT INTO users (username, password, score) VALUES (?, ?, ?)", [username, password, 0], (err) => {
        if (err) {
            res.status(500).send("注册失败");
        } else {
            res.send("注册成功");
        }
    });
});

// 提交猜数字游戏结果
app.post('/game', (req, res) => {
    const { userId, guess } = req.body;
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    let message = '';
    let score = 0;

    if (guess == randomNumber) {
        message = '恭喜你，猜对了！';
        score = 10;
    } else {
        message = `很遗憾，正确的数字是 ${randomNumber}`;
    }

    // 更新用户积分
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            res.status(500).send("服务器错误");
        } else {
            const newScore = row.score + score;
            db.run("UPDATE users SET score = ? WHERE id = ?", [newScore, userId]);
            res.json({ message, newScore });
        }
    });
});

// 启动服务器
app.listen(3000, () => {
    console.log('服务器已启动，访问 http://localhost:3000');
});
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/game.db');  // 确保路径正确

// 创建表格
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, score INTEGER)");

// 用户注册
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // 检查用户名是否已存在
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            res.status(500).send("服务器错误");
        } else if (row) {
            res.status(400).send("用户名已存在");
        } else {
            // 插入新用户
            db.run("INSERT INTO users (username, password, score) VALUES (?, ?, ?)", [username, password, 0], (err) => {
                if (err) {
                    res.status(500).send("注册失败");
                } else {
                    res.send("注册成功");
                }
            });
        }
    });
});// 其他数据库操作...