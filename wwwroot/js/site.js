"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

// https://www.ietf.org/rfc/rfc3526.txt
const P = 5809605995369958062791915965639201402176612226902900533702900882779736177890990861472094774477339581147373410185646378328043729800750470098210924487866935059164371588168047540943981644516632755067501626434556398193186628990071248660819361205119793693985433297036118232914410171876807536457391277857011849897410207519105333355801121109356897459426271845471397952675959440793493071628394122780510124618488232602464649876850458861245784240929258426287699705312584509625419513463605155428017165714465363094021609290561084025893662561222573202082865797821865270991145082200656978177192827024538990239969175546190770645685893438011714430426409338676314743571154537142031573004276428701433036381801705308659830751190352946025482059931306571004727362479688415574702596946457770284148435989129632853918392117997472632693078113129886487399347796982772784615865232621289656944284216824611318709764535152507354116344703769998514148343807n;
const G = 2;

const MIN_RNG = 1000;
const MAX_RNG = 2000;

let numA = BigInt(0);
let numB = BigInt(0);
let rand_num = BigInt(0);
let secret = BigInt(0);

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

function clientACheck(clientA, clientB) {
    console.log("clientACheck", clientA, clientB);
    if (clientB != RECEIVER_ID) return false;
    if (clientA != MY_ID) return false;
    console.log("clientACheck TRUE");
    return true;
}

function clientBCheck(clientA, clientB) {
    console.log("clientBCheck", clientA, clientB);
    if (clientA != RECEIVER_ID) return false;
    if (clientB != MY_ID) return false;
    console.log("clientBCheck TRUE");
    return true;
}

// CLIENT A
connection.on("Ping", function (clientA, clientB) {
    console.log(`Received Ping: ${clientA} ${clientB}`);
    if (!clientACheck(clientA, clientB)) return;

    // const encryptionMethod = document.getElementById("encryptionMethods").value;

    connection.invoke("RequestStartConversation", MY_ID, RECEIVER_ID).catch(function (err) {
        return console.error(err.toString());
    });

    rand_num = BigInt(getRndInteger());

    numA = (BigInt(G) ** BigInt(rand_num)) % BigInt(P);
    console.log("rand_num: ", rand_num);
    console.log("numA: ", numA);

    connection.invoke("SendA", MY_ID, RECEIVER_ID, numA.toString()).catch(function (err) {
        return console.error(err.toString());
    });
});

// BOTH CLIENTS
connection.on("ReceiveEncryptedMessage", function (sender, receiver, message, encryptionMethod) {
    if (
        !(
            (sender == MY_ID && receiver == RECEIVER_ID)
            ||
            (sender == RECEIVER_ID && receiver == MY_ID)
        )
    ) return;
    
    console.log(`ReceiveEncryptedMessage: ${sender} ${receiver} ${message} - Encryption method: ${encryptionMethod}`);
    console.log("Secret", secret);
    if (secret == BigInt(0)) return;
    console.log(`ReceiveEncryptedMessage: ${sender} ${receiver} ${message} - validated`);

    const decodedMessage = decodeMessage(message); // Decode message from Base64

    let decryptedMessage = "";

    switch (encryptionMethod) {
        case "none":
            decryptedMessage = decodedMessage;
            break; // No encryption applied
        case "xorN":
            decryptedMessage = xorDecrypt(decodedMessage, secret);
            break; // Apply XOR encryption
        case "cezar":
            decryptedMessage = caesarDecrypt(decodedMessage, secret);
            break; // Apply Caesar cipher encryption
        default:
            console.error("Invalid encryption method");
            break;
    }

    const li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    li.textContent = `${sender} says ${decryptedMessage}`;
    console.log("ReceiveEncryptedMessage ended.");
});

// CLIENT B
connection.on("StartConversation", function (clientA, clientB) {
    if (!clientBCheck(clientA, clientB)) return;

    console.log(`StartConversation: ${clientA} ${clientB}`);


    rand_num = BigInt(getRndInteger());
    
    numB = (BigInt(G) ** BigInt(rand_num)) % BigInt(P);
    console.log("rand_num: ", rand_num);
    console.log("numB: ", numB);

    connection.invoke("SendB", clientA, clientB, numB.toString()).catch(function (err) {
        return console.error(err.toString());
    });
    console.log("StartConversation ended.");
});

// CLIENT B
connection.on("RecieveA", function (clientA, clientB, new_numA) {
    if (!clientBCheck(clientA, clientB)) return;
    console.log(`RecieveA: ${clientA} ${clientB} ${new_numA}`);
    numA = new_numA;

    secret = BigInt(numA) ** BigInt(rand_num) % BigInt(P);
    console.log("True Secret", secret);

    connection.invoke("SendReadyToTalk", MY_ID, RECEIVER_ID);

    console.log("RecieveA ended.");
});

// CLIENT A
connection.on("RecieveB", function (clientA, clientB, new_numB) {
    if (!clientACheck(clientA, clientB)) return;
    console.log(`RecieveB: ${clientA} ${clientB} ${new_numB}`);
    numB = new_numB;

    secret = BigInt(numB) ** BigInt(rand_num) % BigInt(P);
    console.log("True Secret", secret);

    connection.invoke("SendReadyToTalk", MY_ID, RECEIVER_ID);

    console.log("RecieveB ended.");
});

// BOTH CLIENTS
connection.on("ReceiveReadyToTalk", function (sender) {
    if (sender != RECEIVER_ID) return;

    document.getElementById("sendButton").disabled = false;

    console.log("ReceiveReadyToTalk ended.");
});

connection.start().then(function () {
    connection.invoke("Ping", RECEIVER_ID).catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    console.log(`BUTTON CLICKED`);
    const encryptionMethod = document.getElementById("encryptionMethods").value;

    if (secret == BigInt(0)) return;

    const message = document.getElementById("messageInput").value;

    console.log("Sending message: ", MY_ID, RECEIVER_ID, message, encryptionMethod);

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

    const encodedMessage = encodeMessage(encryptedMessage);
    console.log("Base64 encrypted message:", encodedMessage);

    connection.invoke("SendEncryptedMessage", MY_ID, RECEIVER_ID, encodedMessage, encryptionMethod).catch(function (err) {
        return console.error(err.toString());
    });

    console.log("Message sent: ", MY_ID, RECEIVER_ID, message, encryptionMethod);
    event.preventDefault();
});

function encodeMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const base64 = btoa(String.fromCharCode(...data));
    return base64;
  }
  
  function decodeMessage(base64) {
    const decoder = new TextDecoder();
    const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const message = decoder.decode(data);
    return message;
  }

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
        secretBytes.push(Number(secret & BigInt(0xFF)));
        secret = secret >> BigInt(8);
    }
    return secretBytes;
}

function caesarEncrypt(message, secret) {
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

function caesarDecrypt(encryptedMessage, secret) {
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

function getRndInteger() {
    return Math.floor(Math.random() * (MAX_RNG - MIN_RNG)) + MIN_RNG;
}