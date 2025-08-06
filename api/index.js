const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();

// 中间件
app.use('/static', express.static(path.join(__dirname, '..', 'static')));
app.use(express.json());

// 统一的加密工具函数
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';

function generateRandomPassword(length = 12) {
  return [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function sha256(message) {
  return crypto.createHash('sha256').update(message, 'utf8').digest('hex');
}

function hashToPassword(hash) {
  let password = '';
  // 确保密码包含各种字符类型
  password += chars[parseInt(hash.substr(0, 2), 16) % 26]; // Uppercase
  password += chars[26 + parseInt(hash.substr(2, 2), 16) % 26]; // Lowercase
  password += chars[52 + parseInt(hash.substr(4, 2), 16) % 10]; // Numbers
  password += chars[62 + parseInt(hash.substr(6, 2), 16) % 14]; // Symbols

  // 填充剩余字符
  for (let i = 4; i < 16; i++) {
    const index = parseInt(hash.substr(i * 2, 2), 16) % chars.length;
    password += chars[index];
  }
  return password;
}

function encryptPassword(input) {
  return hashToPassword(sha256(input));
}

// API 路由 - 返回纯文本
// GET /api/random - 返回随机密码字符串
app.get('/api/random', (req, res) => {
  try {
    const randomPassword = generateRandomPassword();
    const encryptedPassword = encryptPassword(randomPassword);

    res.type('text/plain');
    res.send(encryptedPassword);
  } catch (error) {
    console.error('Random generation error:', error);
    res.status(500).type('text/plain').send('Error generating password');
  }
});

// 明确处理根目录下的静态文件
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/favicon.ico', (req, res) => {
  res.status(404).send('Not Found');
});

app.get('/robots.txt', (req, res) => {
  res.status(404).send('Not Found');
});

// GET /api/{input} - 返回加密后的字符串
app.get('/api/:input', (req, res) => {
  try {
    const input = decodeURIComponent(req.params.input);

    // 排除特殊路径
    if (input === 'info') {
      return res.json({
        name: 'E-PASSWORD API',
        version: '1.0.0',
        endpoints: {
          'GET /api/random': 'Generate random encrypted password',
          'GET /api/{text}': 'Encrypt specific text',
          'GET /': 'Web interface',
          'GET /{text}': 'Web interface with text routing'
        },
        examples: {
          random: `${req.protocol}://${req.get('host')}/api/random`,
          encrypt: `${req.protocol}://${req.get('host')}/api/hello`
        }
      });
    }

    const encryptedPassword = encryptPassword(input);

    res.type('text/plain');
    res.send(encryptedPassword);
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).type('text/plain').send('Error encrypting input');
  }
});

// 前端页面路由
// 根路径和所有非API路径都返回前端页面
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading page');
  }
});

// 处理前端路由（如 /random, /hello 等）
app.get('/:path', (req, res) => {
  const requestPath = req.params.path;

  // 如果是API路径，跳过（这些应该已经被上面的路由处理了）
  if (requestPath.startsWith('api')) {
    return res.status(404).send('API endpoint not found');
  }

  // 排除静态文件和特殊文件
  if (requestPath.includes('.') ||
    requestPath === 'favicon.ico' ||
    requestPath === 'robots.txt' ||
    requestPath === 'static') {
    return res.status(404).send('Not Found');
  }

  // 返回前端页面，让前端JavaScript处理路由
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;
