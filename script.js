document.getElementById('inputPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        encryptAndCopyPassword();
    }
});

async function encryptAndCopyPassword() {
    const inputPassword = document.getElementById('inputPassword').value.trim();
    if (!inputPassword) {
        showToast("Please enter password to encrypt");
        return;
    }

    try {
        const encryptedPassword = await encryptPassword(inputPassword);
        document.getElementById('passwordText').value = encryptedPassword;
        await copyToClipboard(encryptedPassword);
        showToast("Encrypted password copied to clipboard");
    } catch (error) {
        showToast("Failed to copy to clipboard");
        console.error("Copy failed:", error);
    }
}

async function encryptPassword(password) {
    const hash = await sha256(password);
    return hashToPassword(hash);
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

async function generateAndCopyRandomPassword() {
    try {
        const randomPassword = generateRandomPassword();
        document.getElementById('inputPassword').value = randomPassword;
        const encryptedPassword = await encryptPassword(randomPassword);
        document.getElementById('passwordText').value = encryptedPassword;
        await copyToClipboard(encryptedPassword);
        showToast("Random password copied to clipboard");
    } catch (error) {
        showToast("Failed to copy to clipboard");
        console.error("Copy failed:", error);
    }
}

async function copyToClipboard(text) {
    try {
        // 尝试使用现代 API
        await navigator.clipboard.writeText(text);
        console.log("Copied to clipboard using navigator.clipboard");
    } catch (err) {
        console.warn("navigator.clipboard.writeText failed, trying fallback. Error:", err);
        // Fallback 方法
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        // 防止影响布局
        tempInput.style.position = 'fixed';
        tempInput.style.top = '-9999px';
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log("Copied to clipboard using execCommand");
            } else {
                throw new Error("execCommand unsuccessful");
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            throw err;
        }
        document.body.removeChild(tempInput);
    }
}

document.getElementById('inputPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        encryptAndCopyPassword();
    }
});

async function encryptAndCopyPassword() {
    const inputPassword = document.getElementById('inputPassword').value.trim();
    if (!inputPassword) {
        showToast("Please enter password to encrypt");
        return;
    }

    try {
        const encryptedPassword = await encryptPassword(inputPassword);
        document.getElementById('passwordText').value = encryptedPassword;
        await copyToClipboard(encryptedPassword);
        showToast("Encrypted password copied to clipboard");
    } catch (error) {
        showToast("Failed to copy to clipboard");
        console.error("Copy failed:", error);
    }
}

async function encryptPassword(password) {
    const hash = await sha256(password);
    return hashToPassword(hash);
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

async function generateAndCopyRandomPassword() {
    try {
        const randomPassword = generateRandomPassword();
        document.getElementById('inputPassword').value = randomPassword;
        const encryptedPassword = await encryptPassword(randomPassword);
        document.getElementById('passwordText').value = encryptedPassword;
        await copyToClipboard(encryptedPassword);
        showToast("Random password copied to clipboard");
    } catch (error) {
        showToast("Failed to copy to clipboard");
        console.error("Copy failed:", error);
    }
}

async function copyToClipboard(text) {
    try {
        // 尝试使用现代 API
        await navigator.clipboard.writeText(text);
        console.log("Copied to clipboard using navigator.clipboard");
    } catch (err) {
        console.warn("navigator.clipboard.writeText failed, trying fallback. Error:", err);
        // Fallback 方法
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        // 防止影响布局
        tempInput.style.position = 'fixed';
        tempInput.style.top = '-9999px';
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log("Copied to clipboard using execCommand");
            } else {
                throw new Error("execCommand unsuccessful");
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            throw err;
        }
        document.body.removeChild(tempInput);
    }
}

function clearFields() {
    document.getElementById('inputPassword').value = '';
    document.getElementById('passwordText').value = '';
    showToast("Fields cleared");
}

// 检查 URL 参数
window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pwd = urlParams.get('pwd');
    const random = urlParams.get('random');

    if (random !== null) {
        try {
            const randomPassword = generateRandomPassword();
            document.getElementById('inputPassword').value = randomPassword;
            const encryptedPassword = await encryptPassword(randomPassword);
            document.getElementById('passwordText').value = encryptedPassword;
            await copyToClipboard(encryptedPassword);
            showToast("Random password copied to clipboard");
        } catch (error) {
            console.error("Error processing random password:", error);
            showToast("Failed to generate random password");
        }
    } else if (pwd) {
        try {
            const encryptedPassword = await encryptPassword(pwd);
            document.getElementById('passwordText').value = encryptedPassword;
            await copyToClipboard(encryptedPassword);
            showToast("Encrypted password copied to clipboard");
        } catch (error) {
            console.error("Error processing password:", error);
            showToast("Failed to encrypt password");
        }
    }
};