using Microsoft.AspNetCore.SignalR;
using backend.Hubs;
using backend.Models;

namespace backend.Services
{
    public class MessageService : BackgroundService
    {
        private readonly IHubContext<MessageHub> _hubContext;
        private readonly ILogger<MessageService> _logger;
        private readonly Random _random = new();
        private readonly string[] _sampleMessages = {
            "Sistema funcionando normalmente",
            "Processamento de dados em andamento",
            "Backup realizado com sucesso",
            "Conexão com banco de dados estável",
            "Monitoramento ativo"
        };

        public MessageService(IHubContext<MessageHub> hubContext, ILogger<MessageService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Serviço de mensagens iniciado");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var message = GenerateRandomMessage();
                    await _hubContext.Clients.All.SendAsync("ReceiveMessage", message, stoppingToken);
                    _logger.LogInformation($"Mensagem enviada: {message.Body}");

                    // Aguarda 5 segundos antes da próxima mensagem
                    await Task.Delay(5000, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao enviar mensagem");
                    await Task.Delay(5000, stoppingToken);
                }
            }
        }

        private Message GenerateRandomMessage()
        {
            return new Message
            {
                Body = _sampleMessages[_random.Next(_sampleMessages.Length)],
                Timestamp = DateTime.UtcNow
            };
        }
    }
}