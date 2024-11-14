# Password Generator

A simple password generator web application. You can input a common password and generate an encrypted password, or get a random password.

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

## Contribution

Feel free to submit issues and pull requests to improve this project.



