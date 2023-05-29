
export function encodeMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const base64 = btoa(String.fromCharCode(...data));
    return base64;
  }
  
export function decodeMessage(base64) {
    const decoder = new TextDecoder();
    const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const message = decoder.decode(data);
    return message;
}

export function xorEncrypt(message, secret) {
    const secretBytes = getSecretBytes(secret);
    let encryptedMessage = "";

    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i);
        const keyByte = secretBytes[i % secretBytes.length];
        const encryptedCharCode = charCode ^ keyByte;
        encryptedMessage += String.fromCharCode(encryptedCharCode);
    }

    return encryptedMessage;
}

export function xorDecrypt(encryptedMessage, secret) {
    const secretBytes = getSecretBytes(secret);
    let decryptedMessage = "";

    for (let i = 0; i < encryptedMessage.length; i++) {
        const charCode = encryptedMessage.charCodeAt(i);
        const keyByte = secretBytes[i % secretBytes.length];
        const decryptedCharCode = charCode ^ keyByte;
        decryptedMessage += String.fromCharCode(decryptedCharCode);
    }

    return decryptedMessage;
}

function getSecretBytes(secret) {
    const secretBytes = [];
    for (let i = 0; i < 4; i++) {
        secretBytes.push(Number(secret & BigInt(0xFF)));
        secret = secret >> BigInt(8);
    }
    return secretBytes;
}

export function caesarEncrypt(message, secret) {
    const key = Number(secret % BigInt(26));
    let encryptedMessage = "";

    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i);

        if (charCode >= 65 && charCode <= 90) {
            const encryptedCharCode = ((charCode - 65 + key) % 26) + 65;
            encryptedMessage += String.fromCharCode(encryptedCharCode);
        } else if (charCode >= 97 && charCode <= 122) {
            const encryptedCharCode = ((charCode - 97 + key) % 26) + 97;
            encryptedMessage += String.fromCharCode(encryptedCharCode);
        } else {
            encryptedMessage += message.charAt(i);
        }
    }

    return encryptedMessage;
}

export function caesarDecrypt(encryptedMessage, secret) {
    const key = Number(secret % BigInt(26));
    let decryptedMessage = "";

    for (let i = 0; i < encryptedMessage.length; i++) {
        const charCode = encryptedMessage.charCodeAt(i);

        if (charCode >= 65 && charCode <= 90) {
            const decryptedCharCode = ((charCode - 65 - key + 26) % 26) + 65;
            decryptedMessage += String.fromCharCode(decryptedCharCode);
        } else if (charCode >= 97 && charCode <= 122) {
            const decryptedCharCode = ((charCode - 97 - key + 26) % 26) + 97;
            decryptedMessage += String.fromCharCode(decryptedCharCode);
        } else {
            decryptedMessage += encryptedMessage.charAt(i);
        }
    }

    return decryptedMessage;
}