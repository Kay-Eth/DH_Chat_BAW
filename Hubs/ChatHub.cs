using Microsoft.AspNetCore.SignalR;

namespace BawChat.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task RequestStartConversation(string sender, string reciever)
        {
            await Clients.All.SendAsync("StartConversation", sender, reciever);
            Console.WriteLine($"RequestStartConversation {sender} {reciever}");
        }

        public async Task SendPG(string sender, string reciever, string p, int g)
        {
            await Clients.All.SendAsync("RecievePG", sender, reciever, p, g);
            Console.WriteLine($"SendPG {sender} {reciever} {p} {g}");
        }

        public async Task SendA(string sender, string reciever, string A)
        {
            Console.WriteLine($"RecieveA {sender} {reciever} {A}");
            await Clients.All.SendAsync("RecieveA", sender, reciever, A);
        }

        public async Task SendB(string sender, string reciever, string B)
        {
            Console.WriteLine($"RecieveB {sender} {reciever} {B}");
            await Clients.All.SendAsync("RecieveB", sender, reciever, B);
        }

        public async Task SetEncryption(string sender, string reciever, string method)
        {
            await Clients.All.SendAsync("RequestEncryption", sender, reciever, method);
        }

        public async Task SendEncryptedMessage(string sender, string reciever, string encryptedMessage)
        {
            Console.WriteLine($"SendEncryptedMessage {sender} {reciever} {encryptedMessage}");
            await Clients.All.SendAsync("RecieveEncryptedMessage", sender, reciever, encryptedMessage);
        }
    }
}