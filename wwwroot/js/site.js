"use strict";

// site.js - client side script for implementing DH protocol exchange and Chat functionality

import * as encryption_lib from "./encryption.js";

// SignalR connection object
const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

// https://www.ietf.org/rfc/rfc3526.txt
const P = 5809605995369958062791915965639201402176612226902900533702900882779736177890990861472094774477339581147373410185646378328043729800750470098210924487866935059164371588168047540943981644516632755067501626434556398193186628990071248660819361205119793693985433297036118232914410171876807536457391277857011849897410207519105333355801121109356897459426271845471397952675959440793493071628394122780510124618488232602464649876850458861245784240929258426287699705312584509625419513463605155428017165714465363094021609290561084025893662561222573202082865797821865270991145082200656978177192827024538990239969175546190770645685893438011714430426409338676314743571154537142031573004276428701433036381801705308659830751190352946025482059931306571004727362479688415574702596946457770284148435989129632853918392117997472632693078113129886487399347796982772784615865232621289656944284216824611318709764535152507354116344703769998514148343807n;
const G = 2;

// Random number range for DH protocol
const MIN_RNG = 1000;
const MAX_RNG = 2000;

// DH properties
let numA = BigInt(0);
let numB = BigInt(0);
let rand_num = BigInt(0);
let secret = BigInt(0);

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

/**
 * Checks if recieved message has valid sender and receiver
 * @function
 * @param {string} clientA clientA's GUID
 * @param {string} clientB clientB's GUID
 * @returns {boolean}
 */
function clientACheck(clientA, clientB) {
    console.log("clientACheck", clientA, clientB);
    if (clientB != RECEIVER_ID) return false;
    if (clientA != MY_ID) return false;
    console.log("clientACheck TRUE");
    return true;
}

/**
 * Checks if recieved message has valid sender and receiver
 * @function
 * @param {string} clientA clientA's GUID
 * @param {string} clientB clientB's GUID
 * @returns {boolean}
 */
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

    const decodedMessage = encryption_lib.decodeMessage(message); // Decode message from Base64

    let decryptedMessage = "";

    switch (encryptionMethod) {
        case "none":
            decryptedMessage = decodedMessage;
            break; // No encryption applied
        case "xorN":
            decryptedMessage = encryption_lib.xorDecrypt(decodedMessage, secret);
            break; // Apply XOR encryption
        case "cezar":
            decryptedMessage = encryption_lib.caesarDecrypt(decodedMessage, secret);
            break; // Apply Caesar cipher encryption
        default:
            console.error("Invalid encryption method");
            break;
    }

    const li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);

    const sender_username = USERNAMES[sender]

    li.textContent = `${sender_username} says ${decryptedMessage}`;
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

// Ping recevier
connection.start().then(function () {
    connection.invoke("Ping", RECEIVER_ID).catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});

// After clicking Send button
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
            encryptedMessage = encryption_lib.xorEncrypt(message, secret);
            break; // Apply XOR encryption
        case "cezar":
            encryptedMessage = encryption_lib.caesarEncrypt(message, secret);
            break; // Apply Caesar cipher encryption
        default:
            console.error("Invalid encryption method");
            break;
    }

    const encodedMessage = encryption_lib.encodeMessage(encryptedMessage);
    console.log("Base64 encrypted message:", encodedMessage);

    connection.invoke("SendEncryptedMessage", MY_ID, RECEIVER_ID, encodedMessage, encryptionMethod).catch(function (err) {
        return console.error(err.toString());
    });

    console.log("Message sent: ", MY_ID, RECEIVER_ID, message, encryptionMethod);
    event.preventDefault();
});

/**
 * Generates a random number for DH protocol
 * @function
 * @returns {number}
 */
function getRndInteger() {
    return Math.floor(Math.random() * (MAX_RNG - MIN_RNG)) + MIN_RNG;
}