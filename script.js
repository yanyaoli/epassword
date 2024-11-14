document.getElementById('inputPassword').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        encryptAndCopyPassword();
    }
});

async function encryptAndCopyPassword() {
    const inputPassword = document.getElementById('inputPassword').value;
    if (!inputPassword) {
        showToast("Please enter password to encrypt");
        return;
    }

    const encryptedPassword = await encryptPassword(inputPassword);
    document.getElementById('passwordText').value = encryptedPassword;
    copyToClipboard(encryptedPassword);
    showToast("Encrypted password copied to clipboard");
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
    const randomPassword = generateRandomPassword();
    document.getElementById('inputPassword').value = randomPassword;
    const encryptedPassword = await encryptPassword(randomPassword);
    document.getElementById('passwordText').value = encryptedPassword;
    copyToClipboard(encryptedPassword);
    showToast("Random password copied to clipboard");
}

function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
}

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pwd = urlParams.get('pwd');
    const random = urlParams.get('random');

    if (random !== null) {
        const randomPassword = generateRandomPassword();
        const encryptedPassword = await encryptPassword(randomPassword);
        const result = {
            password: randomPassword,
            epassword: encryptedPassword
        };
        document.head.innerHTML = '<meta http-equiv="Content-Type" content="application/json; charset=UTF-8">';
        document.body.innerText = JSON.stringify(result);
    } else if (pwd) {
        const encryptedPassword = await encryptPassword(pwd);
        const result = {
            password: pwd,
            epassword: encryptedPassword
        };
        document.head.innerHTML = '<meta http-equiv="Content-Type" content="application/json; charset=UTF-8">';
        document.body.innerText = JSON.stringify(result);
    }
};