using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class MessageHub : Hub
    {
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserJoined", $"Usuário {Context.ConnectionId} entrou no grupo {groupName}");
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserLeft", $"Usuário {Context.ConnectionId} saiu do grupo {groupName}");
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Cliente conectado: {Context.ConnectionId}");
            await Clients.All.SendAsync("UserConnected", $"Cliente {Context.ConnectionId} conectado");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Cliente desconectado: {Context.ConnectionId}");
            await Clients.All.SendAsync("UserDisconnected", $"Cliente {Context.ConnectionId} desconectado");
            await base.OnDisconnectedAsync(exception);
        }
    }
}