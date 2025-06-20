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

        private readonly string[] _messageTypes = { "info", "warning", "success", "error" };
        private readonly string[] _sampleMessages = {
            "Sistema funcionando normalmente",
            "Processamento de dados em andamento",
            "Nova atualização disponível",
            "Backup realizado com sucesso",
            "Conexão com banco de dados estável",
            "Monitoramento ativo",
            "Cache atualizado",
            "Logs sendo processados",
            "Métricas coletadas",
            "Serviço em operação"
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

                    // Envia mensagem para todos os clientes conectados
                    await _hubContext.Clients.All.SendAsync("ReceiveMessage", message, stoppingToken);

                    _logger.LogInformation($"Mensagem enviada: {message.Content}");

                    // Aguarda entre 3 a 8 segundos antes da próxima mensagem
                    var delay = _random.Next(3000, 8000);
                    await Task.Delay(delay, stoppingToken);
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
            var content = _sampleMessages[_random.Next(_sampleMessages.Length)];
            var type = _messageTypes[_random.Next(_messageTypes.Length)];

            return new Message
            {
                Content = content,
                Type = type,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}