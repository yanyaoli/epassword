const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());

// 统一的加密工具函数
const OLD_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
const NEW_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';

function getChars(version = 'new') {
  return version === 'new' ? NEW_CHARS : OLD_CHARS;
}

function generateRandomPassword(length = 12, version = 'new') {
  const chars = getChars(version);
  return [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function sha256(message) {
  return crypto.createHash('sha256').update(message, 'utf8').digest('hex');
}

function hashToPassword(hash, version = 'new') {
  const chars = getChars(version);
  let password = '';
  // 确保密码包含各种字符类型
  password += chars[parseInt(hash.substr(0, 2), 16) % 26]; // Uppercase
  password += chars[26 + parseInt(hash.substr(2, 2), 16) % 26]; // Lowercase
  password += chars[52 + parseInt(hash.substr(4, 2), 16) % 10]; // Numbers
  if (version === 'new') {
    password += chars[62]; // _
  } else {
    password += chars[62 + parseInt(hash.substr(6, 2), 16) % 14]; // Symbols
  }

  // 填充剩余字符
  for (let i = 4; i < 16; i++) {
    const index = parseInt(hash.substr(i * 2, 2), 16) % chars.length;
    password += chars[index];
  }
  return password;
}

function encryptPassword(input, version = 'new') {
  return hashToPassword(sha256(input), version);
}

// API 路由 - 返回纯文本
// GET /api/random - 返回随机密码字符串
app.get('/api/random', (req, res) => {
  try {
    const version = req.query.version === 'old' ? 'old' : 'new';
    const randomPassword = generateRandomPassword(12, version);
    const encryptedPassword = encryptPassword(randomPassword, version);

    res.type('text/plain');
    res.send(encryptedPassword);
  } catch (error) {
    console.error('Random generation error:', error);
    res.status(500).type('text/plain').send('Error generating password');
  }
});

// 明确处理根目录下的静态文件
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
    const version = req.query.version === 'old' ? 'old' : 'new';

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

    const encryptedPassword = encryptPassword(input, version);

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
  console.log('Root route accessed');
  try {
    res.sendFile(path.join(__dirname, 'index.html'));
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
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器（仅在本地开发时）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 E-PASSWORD Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('📱 前端页面:');
    console.log(`   http://localhost:${PORT}/              - 主页`);
    console.log(`   http://localhost:${PORT}/random        - 随机密码页面`);
    console.log(`   http://localhost:${PORT}/hello         - 加密"hello"页面`);
    console.log('');
    console.log('📡 API接口:');
    console.log(`   http://localhost:${PORT}/api/random    - 随机密码API`);
    console.log(`   http://localhost:${PORT}/api/hello     - 加密"hello"API`);
    console.log(`   http://localhost:${PORT}/api/info      - API信息`);
    console.log('');
    console.log('💡 提示: 前端页面支持路径路由，API接口返回纯文本');
  });
}

// 导出应用供 Vercel 使用
module.exports = app;
