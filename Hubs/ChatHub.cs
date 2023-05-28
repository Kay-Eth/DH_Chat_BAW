using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BawChat.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task Ping(string clientA)
        {
            Console.WriteLine($"Ping {clientA}");
            await Clients.User(clientA).SendAsync("Ping", clientA, Context.UserIdentifier);
        }

        public async Task RequestStartConversation(string clientA, string clientB)
        {
            await Clients.User(clientB).SendAsync("StartConversation", clientA, clientB);
            Console.WriteLine($"RequestStartConversation {clientA} {clientB}");
        }

        public async Task SendA(string clientA, string clientB, string A)
        {
            Console.WriteLine($"RecieveA {clientA} {clientB} {A}");
            await Clients.User(clientB).SendAsync("RecieveA", clientA, clientB, A);
        }

        public async Task SendB(string clientA, string clientB, string B)
        {
            Console.WriteLine($"RecieveB {clientA} {clientB} {B}");
            await Clients.User(clientA).SendAsync("RecieveB", clientA, clientB, B);
        }

        public async Task SendEncryptedMessage(string sender, string receiver, string encryptedMessage, string encryptionMethod)
        {
            Console.WriteLine($"SendEncryptedMessage {sender} {receiver} {encryptedMessage} {encryptionMethod}");
            await Clients.User(sender).SendAsync("ReceiveEncryptedMessage", sender, receiver, encryptedMessage, encryptionMethod);
            await Clients.User(receiver).SendAsync("ReceiveEncryptedMessage", sender, receiver, encryptedMessage, encryptionMethod);
        }

        public async Task SendReadyToTalk(string sender, string receiver)
        {
            await Clients.User(receiver).SendAsync("ReceiveReadyToTalk", sender);
        }
    }
}