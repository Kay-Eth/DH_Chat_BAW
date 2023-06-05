using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BawChat.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        /// <summary>
        /// Sends Ping to clientA
        /// </summary>
        /// <param name="clientA">client A's GUID</param>
        public async Task Ping(string clientA)
        {
            Console.WriteLine($"Ping {clientA}");
            await Clients.User(clientA).SendAsync("Ping", clientA, Context.UserIdentifier);
        }

        /// <summary>
        /// Sends StartConversation to client B
        /// </summary>
        /// <param name="clientA">client A's GUID</param>
        /// <param name="clientB">client B's GUID</param>
        public async Task RequestStartConversation(string clientA, string clientB)
        {
            await Clients.User(clientB).SendAsync("StartConversation", clientA, clientB);
            Console.WriteLine($"RequestStartConversation {clientA} {clientB}");
        }

        /// <summary>
        /// Sends RecieveA to client B
        /// </summary>
        /// <param name="clientA">client A's GUID</param>
        /// <param name="clientB">client B's GUID</param>
        /// <param name="A">DH A parameter</param>
        public async Task SendA(string clientA, string clientB, string A)
        {
            Console.WriteLine($"RecieveA {clientA} {clientB} {A}");
            await Clients.User(clientB).SendAsync("RecieveA", clientA, clientB, A);
        }

        /// <summary>
        /// Sends RecieveB to client A
        /// </summary>
        /// <param name="clientA">client A's GUID</param>
        /// <param name="clientB">client B's GUID</param>
        /// <param name="B">DH A parameter</param>
        public async Task SendB(string clientA, string clientB, string B)
        {
            Console.WriteLine($"RecieveB {clientA} {clientB} {B}");
            await Clients.User(clientA).SendAsync("RecieveB", clientA, clientB, B);
        }

        /// <summary>
        /// Sends encrypted message to recevier
        /// </summary>
        /// <param name="sender">sender's GUID</param>
        /// <param name="receiver">receiver's GUID</param>
        /// <param name="encryptedMessage">encrypted message</param>
        /// <param name="encryptionMethod">encryption method</param>
        public async Task SendEncryptedMessage(string sender, string receiver, string encryptedMessage, string encryptionMethod)
        {
            Console.WriteLine($"SendEncryptedMessage {sender} {receiver} {encryptedMessage} {encryptionMethod}");
            await Clients.User(sender).SendAsync("ReceiveEncryptedMessage", sender, receiver, encryptedMessage, encryptionMethod);
            await Clients.User(receiver).SendAsync("ReceiveEncryptedMessage", sender, receiver, encryptedMessage, encryptionMethod);
        }

        /// <summary>
        /// Sends ReceiveReadyToTalk to recevier
        /// </summary>
        /// <param name="sender">sender's GUID</param>
        /// <param name="receiver">receiver's GUID</param>
        public async Task SendReadyToTalk(string sender, string receiver)
        {
            await Clients.User(receiver).SendAsync("ReceiveReadyToTalk", sender);
        }
    }
}