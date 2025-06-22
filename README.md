# SignalR + Angular 20

Este guia mostra como criar uma implementação mínima de comunicação em tempo real usando SignalR (.NET) e Angular 20.

## O que será implementado

-   **Backend**: API .NET que envia mensagens automáticas a cada 5 segundos
-   **Frontend**: Interface Angular que recebe e exibe mensagens em tempo real
-   **Comunicação**: Conexão unidirecional via SignalR (servidor → cliente)

## Passo a Passo - Backend (.NET)

### 1. Criar o projeto

```bash
dotnet new webapi -n SignalRBackend
cd SignalRBackend
```

### 2. Adicionar dependências SignalR

```bash
dotnet add package Microsoft.AspNetCore.SignalR
```

### 3. Criar o modelo de mensagem

Criar arquivo `Models/Message.cs`:

```csharp
namespace SignalRBackend.Models
{
    public class Message
    {
        public string Body { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}
```

### 4. Criar o Hub SignalR

Criar arquivo `Hubs/MessageHub.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;

namespace SignalRBackend.Hubs
{
    public class MessageHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
```

### 5. Criar o serviço de mensagens

Criar arquivo `Services/MessageService.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;
using SignalRBackend.Hubs;
using SignalRBackend.Models;

namespace SignalRBackend.Services
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
```

### 6. Configurar Program.cs

Substituir o conteúdo de `Program.cs`:

```csharp
using SignalRBackend.Hubs;
using SignalRBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configurar SignalR
builder.Services.AddSignalR();

// Adicionar o serviço de mensagens
builder.Services.AddHostedService<MessageService>();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngularApp");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Mapear o hub SignalR
app.MapHub<MessageHub>("/messageHub");

app.MapGet("/health", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow });

app.Run();
```

### 7. Executar o backend

```bash
dotnet run
```

O backend estará disponível em `http://localhost:5268`

## Passo a Passo - Frontend (Angular)

### 1. Criar o projeto Angular

```bash
ng new signalr-frontend --standalone --routing=false --style=scss
cd signalr-frontend
```

### 2. Instalar SignalR

```bash
npm install @microsoft/signalr
```

### 3. Criar o modelo de mensagem

Criar arquivo `src/app/models/message.ts`:

```typescript
export interface Message {
    body: string;
    timestamp: Date;
}
```

### 4. Criar o serviço SignalR

Criar arquivo `src/app/services/signalr.ts`:

```typescript
import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';

@Injectable({
    providedIn: 'root',
})
export class SignalrService {
    private hubConnection: HubConnection | null = null;
    private readonly hubUrl = 'http://localhost:5268/messageHub';

    public messages = signal<Message[]>([]);

    constructor() {
        this.initializeConnection();
    }

    private initializeConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl)
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start();
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        if (!this.hubConnection) return;

        this.hubConnection.on('ReceiveMessage', (message: Message) => {
            if (typeof message.timestamp === 'string') {
                message.timestamp = new Date(message.timestamp);
            }

            this.messages.update((messages) => [...messages, message]);
        });
    }
}
```

### 5. Criar componente de exibição de mensagens

Criar arquivo `src/app/components/message-display/message-display.ts`:

```typescript
import { Component, inject } from '@angular/core';
import { SignalrService } from '../../services/signalr';

@Component({
    selector: 'app-message-display',
    imports: [],
    templateUrl: './message-display.html',
    styleUrl: './message-display.scss',
})
export class MessageDisplay {
    private signalrService = inject(SignalrService);
    public messages = this.signalrService.messages;
}
```

Criar arquivo `src/app/components/message-display/message-display.html`:

```html
@for (message of messages(); track $index) {
<div>{{ message.body }}</div>
} @empty {
<div>No messages to display.</div>
}
```

### 6. Configurar o componente principal

Substituir o conteúdo de `src/app/app.ts`:

```typescript
import { Component } from '@angular/core';
import { MessageDisplay } from './components/message-display/message-display';

@Component({
    selector: 'app-root',
    imports: [MessageDisplay],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    title = 'SignalR + Angular 20';
}
```

Substituir o conteúdo de `src/app/app.html`:

```html
<div class="app-container">
    <header class="app-header">
        <h1>{{ title }}</h1>
    </header>

    <main class="app-main">
        <app-message-display></app-message-display>
    </main>
</div>
```

### 7. Executar o frontend

```bash
ng serve
```

O frontend estará disponível em `http://localhost:4200`

## Como testar

1. Iniciar o backend: `dotnet run` (pasta backend)
2. Iniciar o frontend: `ng serve` (pasta frontend)
3. Abrir `http://localhost:4200` no navegador
4. Verificar se as mensagens aparecem a cada 5 segundos

## Funcionalidades implementadas

-   ✅ Backend envia mensagens automáticas a cada 5 segundos
-   ✅ Frontend recebe e exibe mensagens em tempo real
-   ✅ Conexão automática ao iniciar a aplicação
-   ✅ Reconexão automática em caso de perda de conexão

## Estrutura mínima

```
signalr/
├── backend/
│   ├── Hubs/MessageHub.cs          # Hub SignalR mínimo
│   ├── Services/MessageService.cs  # Serviço que envia mensagens
│   ├── Models/Message.cs           # Modelo simples
│   └── Program.cs                  # Configuração
└── frontend/
    └── src/app/
        ├── components/message-display/  # Exibição de mensagens
        ├── models/message.ts            # Interface da mensagem
        ├── services/signalr.ts          # Serviço SignalR
        └── app.ts                       # Componente principal
```

## Tecnologias utilizadas

-   **Backend**: .NET 9, SignalR, ASP.NET Core
-   **Frontend**: Angular 20, TypeScript, Signals
-   **Comunicação**: SignalR (WebSockets)

Esta é a implementação mínima necessária para fazer o SignalR funcionar entre .NET e Angular 20.
