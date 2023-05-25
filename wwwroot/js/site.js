"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

const P = 8375261818725978125910n;
const G = 5;

const MIN_RNG = 15;
const MAX_RNG = 200;

const connections_data = new Map();
// {
//     // "Maciek": {
//     //     "state": 0,
//     //     "secret": 0
//     // },
//     // "Kasia": {
//     //     "state": 0,
//     //     "secret": 0
//     // },
//     // "Pioterk": {
//     //     "state": 0,
//     //     "secret": 0
//     // },
// }

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;
document.getElementById("pInput").value = P.toString();
document.getElementById("gInput").value = G.toString();

connection.on("ReceiveEncryptedMessage", function (sender, receiver, message, encryptionMethod) {
    let secret = 0;
    console.log(`ReceiveEncryptedMessage: ${sender} ${receiver} ${message} - Encryption method: ${encryptionMethod}`);
    
    if (connections_data.has(sender)) secret = connections_data.get(sender).get("secret");
    if (connections_data.has(receiver)) secret = connections_data.get(receiver).get("secret");
    console.log("Secret", secret);
    if (secret == 0) return;
    
    console.log(`ReceiveEncryptedMessage: ${sender} ${receiver} ${message} - validated`);

    let decryptedMessage = message;

    switch (encryptionMethod) {
        case "none":
            break; // No encryption applied
        case "xorN":
            decryptedMessage = xorDecrypt(decryptedMessage, secret);
            break; // Apply XOR encryption
        case "cezar":
            decryptedMessage = caesarDecrypt(decryptedMessage, secret);
            break; // Apply Caesar cipher encryption
        default:
            console.error("Invalid encryption method");
            break;
    }

    const li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${sender} says ${decryptedMessage} with key ${secret}`;
    console.log("ReceiveEncryptedMessage ended.");
});



connection.on("StartConversation", function (clientA, clientB) {
    if (clientB != document.getElementById("myIdInput").value) return;
    if (connections_data.has(clientA)) return;
    console.log(`StartConversation: ${clientA} ${clientB}`);

    connections_data.set(clientA, new Map([["state", 1], ["secret", 0]]));
    connection.invoke("SendPG", clientA, clientB, P.toString(), G).catch(function (err) {
        return console.error(err.toString());
    });

    const secret = getRndInteger();
    connections_data.set(clientA, new Map([["state", 2], ["secret", secret]]));
    
    const numB = (BigInt(G) ** BigInt(secret)) % BigInt(P);
    console.log("Secret: ", secret);
    console.log("NumB: ", numB);

    connection.invoke("SendB", clientA, clientB, numB.toString()).catch(function (err) {
        return console.error(err.toString());
    });
    console.log("StartConversation ended.");
});

connection.on("RecievePG", function (clientA, clientB, p, g) {
    if (clientA != document.getElementById("myIdInput").value) return;
    if (clientB == document.getElementById("myIdInput").value) return;
    if (!connections_data.has(clientB)) return;
    // Add additional checks
    console.log(`RecievePG: ${clientA} ${clientB} ${p} ${g}`);

    const secret = getRndInteger();
    connections_data.set(clientB, new Map([["state", 2], ["secret", secret]]));
    
    const numA = (BigInt(G) ** BigInt(secret)) % BigInt(P);
    console.log("Secret: ", secret);
    console.log("NumA: ", numA);

    connection.invoke("SendA", clientA, clientB, numA.toString()).catch(function (err) {
        return console.error(err.toString());
    });
    console.log("RecievePG ended.");
});

connection.on("RecieveA", function (clientA, clientB, numA) {
    if (clientB != document.getElementById("myIdInput").value) return;
    if (clientA == document.getElementById("myIdInput").value) return;
    if (!connections_data.has(clientA)) return;
    // Add additional checks
    console.log(`RecieveA: ${clientA} ${clientB} ${numA}`)

    const secret = BigInt(numA) ** BigInt(connections_data.get(clientA).get("secret")) % BigInt(P);
    console.log("True Secret", secret);

    connections_data.set(
        clientA, new Map([
            ["state", 3],
            ["secret", secret.toString()]
        ])
    )
    console.log("RecieveA ended.")
});

connection.on("RecieveB", function (clientA, clientB, numB) {
    if (clientA != document.getElementById("myIdInput").value) return;
    if (clientB == document.getElementById("myIdInput").value) return;
    if (!connections_data.has(clientB)) return;
    // Add additional checks
    console.log(`RecieveB: ${clientA} ${clientB} ${numB}`)

    const secret = BigInt(numB) ** BigInt(connections_data.get(clientB).get("secret")) % BigInt(P);
    console.log("True Secret", secret);

    connections_data.set(
        clientB, new Map([
            ["state", 3],
            ["secret", secret.toString()]
        ])
    )
    console.log("RecieveB ended.")
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    console.log(`BUTTON CLICKED`);
    const myId = document.getElementById("myIdInput").value;
    const receiverId = document.getElementById("receiverIdInput").value;
    const encryptionMethod = document.getElementById("encryptionMethods").value;

    if (!connections_data.has(receiverId)) {
        connections_data.set(receiverId, new Map([["state", 1], ["secret", 0]]));
        connection.invoke("RequestStartConversation", myId, receiverId).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        let secret = 0;
        if (connections_data.has(receiverId)) secret = connections_data.get(receiverId).get("secret");
        console.log("Secret", secret);
        if (secret == 0) return;

        const message = document.getElementById("messageInput").value;
        console.log("Send encrypted message", myId, receiverId, message, encryptionMethod);
        let encryptedMessage = "";

        switch (encryptionMethod) {
            case "none":
                encryptedMessage = message;
                break; // No encryption applied
            case "xorN":
                encryptedMessage = xorEncrypt(message, secret);
                break; // Apply XOR encryption
            case "cezar":
                encryptedMessage = caesarEncrypt(message, secret);
                break; // Apply Caesar cipher encryption
            default:
                console.error("Invalid encryption method");
                break;
        }

        connection.invoke("SendEncryptedMessage", myId, receiverId, encryptedMessage, encryptionMethod).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});

function xorEncrypt(message, secret) {
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

function xorDecrypt(encryptedMessage, secret) {
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
        secretBytes.push(secret & 0xFF);
        secret = secret >> 8;
    }
    return secretBytes;
}

function caesarEncrypt(message, secret) {
    const key = secret % 26;
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

function caesarDecrypt(encryptedMessage, secret) {
    const key = secret % 26;
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

function getRndInteger() {
    return Math.floor(Math.random() * (MAX_RNG - MIN_RNG)) + MIN_RNG;
}