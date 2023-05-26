using Microsoft.AspNetCore.SignalR;

namespace BawChat.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task RequestStartConversation(string sender, string receiver)
        {
            await Clients.All.SendAsync("StartConversation", sender, receiver);
            Console.WriteLine($"RequestStartConversation {sender} {receiver}");
        }

        public async Task SendPG(string sender, string receiver, string p, int g)
        {
            await Clients.All.SendAsync("RecievePG", sender, receiver, p, g);
            Console.WriteLine($"SendPG {sender} {receiver} {p} {g}");
        }

        public async Task SendA(string sender, string receiver, string A)
        {
            Console.WriteLine($"RecieveA {sender} {receiver} {A}");
            await Clients.All.SendAsync("RecieveA", sender, receiver, A);
        }

        public async Task SendB(string sender, string receiver, string B)
        {
            Console.WriteLine($"RecieveB {sender} {receiver} {B}");
            await Clients.All.SendAsync("RecieveB", sender, receiver, B);
        }

        public async Task SetEncryption(string sender, string receiver, string method)
        {
            await Clients.All.SendAsync("RequestEncryption", sender, receiver, method);
        }

        public async Task SendEncryptedMessage(string sender, string receiver, string encryptedMessage, string encryptionMethod)
        {
            Console.WriteLine($"SendEncryptedMessage {sender} {receiver} {encryptedMessage} {encryptionMethod}");
            await Clients.All.SendAsync("ReceiveEncryptedMessage", sender, receiver, encryptedMessage, encryptionMethod);
        }

    }
}