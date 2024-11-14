# Epassword

A simple encrypted   password generator web application. You can input a common password and generate an encrypted password, or get a random password.

![index](./intro/index.png)

## Usage

### Manual Input

After deployment, manually input the password on the page and click the "Encrypt" button to get the encrypted result. The encrypted password will be automatically copied to the clipboard, and a toast notification will appear.

### 1. Get Encrypted Password via URL Parameter

You can directly get the encrypted password by passing the `pwd` parameter in the URL. For example:

```
https://www.example.com/?pwd=123
```

You will get the encrypted result:

```json
{"password":"your password","epassword":"encrypted password"}
```

### 2. Generate Random Password via URL Parameter

You can generate a random password by passing the `random` parameter in the URL. For example:

```
https://www.example.com/?random
```

You will get a random password:

```json
{"password":"randomly generated password","epassword":"encrypted password"}
```


## Encryption Logic

- SHA-256 Hash: The input password is hashed using the SHA-256 algorithm. SHA-256 is a widely used cryptographic hash function that generates a 256-bit hash value.

- Hash to Password Conversion: The generated hash value is converted into a password containing uppercase letters, lowercase letters, numbers, and symbols. The steps are as follows:

- Ensure the password contains at least one uppercase letter, one lowercase letter, one number, and one symbol.

- Use different parts of the hash value to select characters, ensuring diversity and complexity.
Generate a password with a length of 16 characters.

```javascript
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
```

## Contribution

Feel free to submit issues and pull requests to improve this project.



