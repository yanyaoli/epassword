// 元素事件绑定
document.getElementById('inputPassword').addEventListener('keydown', e => {
    e.key === 'Enter' && encrypt()
});

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
        showToast("Random password generated");
    } catch (error) {
        showToast("Failed to generate password");
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
    
    try {
        await navigator.clipboard.writeText(text) 
          || document.execCommand('copy', false, text);
        showToast("Copied to clipboard");
    } catch (error) {
        showToast("Failed to copy");
        console.error("Copy error:", error);
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
    showToast("Fields cleared");
}

// 初始化
window.onload = async () => {
    const params = new URLSearchParams(location.search);
    const input = params.get('pwd') || (params.has('random') && generateRandomPassword());
    
    if (input) {
        document.getElementById('inputPassword').value = input;
        document.getElementById('passwordText').value = await hashToPassword(await sha256(input));
    }
};