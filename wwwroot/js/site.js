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

connection.on("RecieveEncryptedMessage", function (sender, reciever, message) {
    let secret = 0;

    console.log(`RecieveEncryptedMessage: ${sender} ${reciever} ${message}`)

    if (connections_data.has(sender)) secret = connections_data.get(sender).get("secret");
    if (connections_data.has(reciever)) secret = connections_data.get(reciever).get("secret");
    console.log("Secret", secret);
    if (secret == 0) return;
    console.log(`RecieveEncryptedMessage: ${sender} ${reciever} ${message} - validated`);

    const li = document.createElement("li");
    document.getElementById("messagesList").appendChild(li);
    // We can assign user-supplied strings to an element's textContent because it
    // is not interpreted as markup. If you're assigning in any other way, you 
    // should be aware of possible script injection concerns.
    li.textContent = `${sender} says ${message} with key ${secret}`;
    console.log("RecieveEncryptedMessage ended.");
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
    console.log(`BUTTON CLICKED`)
    const myId = document.getElementById("myIdInput").value;
    const recieverId = document.getElementById("recieverIdInput").value

    if (!connections_data.has(recieverId)) {
        connections_data.set(recieverId, new Map([["state", 1], ["secret", 0]]))
        connection.invoke("RequestStartConversation", myId, recieverId).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        const message = document.getElementById("messageInput").value;
        console.log("Send encrypted message", myId, recieverId, message);

        connection.invoke("SendEncryptedMessage", myId, recieverId, message).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});

function encrypt() {

}

function getRndInteger() {
    return Math.floor(Math.random() * (MAX_RNG - MIN_RNG)) + MIN_RNG;
}