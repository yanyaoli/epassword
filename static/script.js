// 元素事件绑定
document.getElementById('inputPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    // Enter键时触发复制功能
    handleCopy();
  }
});

// 实时加密事件绑定
document.getElementById('inputPassword').addEventListener('input', async (e) => {
  const input = e.target.value.trim();
  if (input) {
    try {
      const encrypted = await hashToPassword(await sha256(input));
      document.getElementById('passwordText').value = encrypted;
    } catch (error) {
      console.error("Real-time encryption error:", error);
    }
  } else {
    document.getElementById('passwordText').value = '';
  }
});

// 优化的历史记录添加逻辑 - 用户停止输入1秒后添加
let historyTimeout;
document.getElementById('inputPassword').addEventListener('input', (e) => {
  clearTimeout(historyTimeout);
  const input = e.target.value.trim();

  // 只有当输入框有内容且不为空时，才设置延时添加到历史记录
  if (input && input.length > 0) {
    historyTimeout = setTimeout(() => {
      addToHistory(input);
    }, 1000); // 1秒后添加到历史记录
  }
});


async function processUserInput(input) {
  document.getElementById('inputPassword').value = input;
  try {
    const encrypted = await hashToPassword(await sha256(input));
    document.getElementById('passwordText').value = encrypted;
    // 添加到历史记录
    addToHistory(input);
  } catch (error) {
    console.error("Processing input error:", error);
  }
}

// 历史记录管理
const MAX_HISTORY_ITEMS = 5; // 最大历史记录数量

function getHistory() {
  try {
    const history = localStorage.getItem('epassword-history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem('epassword-history', JSON.stringify(history));
  } catch (error) {
    console.error("Error saving history:", error);
  }
}

function addToHistory(input) {
  if (!input || input.trim() === '') return;

  const trimmedInput = input.trim();
  let history = getHistory();

  // 移除重复项
  history = history.filter(item => item !== trimmedInput);

  // 添加到开头
  history.unshift(trimmedInput);

  // 限制历史记录数量
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  saveHistory(history);
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const history = getHistory();
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');

  if (history.length === 0) {
    historySection.style.display = 'none';
    return;
  }

  historySection.style.display = 'block';
  historyList.innerHTML = '';

  history.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'history-item-wrapper';

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = item;
    historyItem.title = item;
    historyItem.onclick = () => selectFromHistory(item);

    wrapper.appendChild(historyItem);
    historyList.appendChild(wrapper);
  });
}

async function selectFromHistory(input) {
  document.getElementById('inputPassword').value = input;
  try {
    const encrypted = await hashToPassword(await sha256(input));
    document.getElementById('passwordText').value = encrypted;
  } catch (error) {
    console.error("Error processing history selection:", error);
  }
}

// 核心功能
async function encrypt() {
  const input = document.getElementById('inputPassword').value.trim();
  if (!input) return showToast("Please enter password to encrypt");

  try {
    const encrypted = await hashToPassword(await sha256(input));
    document.getElementById('passwordText').value = encrypted;
    showToast("Password encrypted");
  } catch (error) {
    showToast("Encryption failed");
    console.error("Encryption error:", error);
  }
}

async function generateRandom() {
  try {
    const random = generateRandomPassword();
    document.getElementById('inputPassword').value = random;
    document.getElementById('passwordText').value = await hashToPassword(await sha256(random));
  } catch (error) {
    showToast("Failed to generate password");
    console.error("Generation error:", error);
  }
}

// 从URL路由生成随机密码（不显示toast）
async function generateRandomFromUrl() {
  try {
    const random = generateRandomPassword();
    document.getElementById('inputPassword').value = random;
    document.getElementById('passwordText').value = await hashToPassword(await sha256(random));
  } catch (error) {
    console.error("Generation error:", error);
  }
}


// 工具函数
async function sha256(message) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hashToPassword(hash) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let password = '';

  password += chars[parseInt(hash.substr(0, 2), 16) % 26]; // Uppercase
  password += chars[26 + parseInt(hash.substr(2, 2), 16) % 26]; // Lowercase
  password += chars[52 + parseInt(hash.substr(4, 2), 16) % 10]; // Numbers
  password += chars[62 + parseInt(hash.substr(6, 2), 16) % 14]; // Symbols

  for (let i = 4; i < 16; i++) {
    const index = parseInt(hash.substr(i * 2, 2), 16) % chars.length;
    password += chars[index];
  }

  return password;
}

function generateRandomPassword(length = 12) {
  return [...Array(length)].map(() =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-='[
    Math.floor(Math.random() * 77)
    ]).join('');
}

// 剪贴板操作
async function handleCopy() {
  const text = document.getElementById('passwordText').value;
  if (!text) return showToast("No content to copy");

  const copyIcon = document.querySelector('.copy-icon');

  try {
    // 方法1: 优先尝试现代剪贴板API (自动复制)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showCopySuccess(copyIcon);
      showToast("Copied to clipboard");
      return;
    }

    // 方法2: 尝试传统的document.execCommand (自动复制)
    if (copyTextFallback(text)) {
      showCopySuccess(copyIcon);
      showToast("Copied to clipboard");
      return;
    }

    // 方法3: 如果自动复制失败，选择文本并提示用户
    selectText(text);
    showToast("Text selected, press Ctrl+C to copy");

  } catch (error) {
    console.error("Copy error:", error);

    // 自动复制失败时的降级处理
    if (copyTextFallback(text)) {
      showCopySuccess(copyIcon);
      showToast("Copied to clipboard");
    } else if (selectText(text)) {
      showToast("Text selected, press Ctrl+C to copy");
    } else {
      showToast("Copy failed, please select text manually");
    }
  }
}

// 传统复制方法 (增强版)
function copyTextFallback(text) {
  try {
    // 确保页面有焦点
    window.focus();

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';

    document.body.appendChild(textArea);

    // 确保textArea获得焦点
    textArea.focus();
    textArea.select();

    // 尝试execCommand
    let result = false;
    try {
      result = document.execCommand('copy');
    } catch (err) {
      console.error("execCommand failed:", err);
    }

    document.body.removeChild(textArea);
    return result;

  } catch (error) {
    console.error("Fallback copy failed:", error);
    return false;
  }
}

// 选择文本方法 (作为最后手段)
function selectText(text) {
  try {
    const passwordField = document.getElementById('passwordText');

    // 确保字段可见且可交互
    passwordField.style.opacity = '1';
    passwordField.readOnly = false;

    passwordField.focus();
    passwordField.select();

    // 如果支持setSelectionRange，确保选择所有文本
    if (passwordField.setSelectionRange) {
      passwordField.setSelectionRange(0, text.length);
    }

    // 恢复只读状态
    passwordField.readOnly = true;

    return true;
  } catch (error) {
    console.error("Text selection failed:", error);
    return false;
  }
}

// 显示复制成功的视觉反馈
function showCopySuccess(copyIcon) {
  if (copyIcon) {
    // 临时改变图标颜色表示成功
    const originalFill = copyIcon.style.fill;
    copyIcon.style.fill = '#4caf50';
    setTimeout(() => {
      copyIcon.style.fill = originalFill;
    }, 1000);
  }
}

// 界面操作
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function clearFields() {
  document.getElementById('inputPassword').value = '';
  document.getElementById('passwordText').value = '';
}

// 初始化
window.onload = () => {
  updateHistoryDisplay();
};