using backend.Hubs;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Configura SignalR
builder.Services.AddSignalR();

// Adiciona o serviço de mensagens como hosted service
builder.Services.AddHostedService<MessageService>();

// Configura CORS para permitir conexões do frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // URL padrão do Angular
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Necessário para SignalR
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Aplica a política CORS
app.UseCors("AllowAngularApp");

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// Mapeia o hub do SignalR
app.MapHub<MessageHub>("/messageHub");

// Adiciona endpoint de health check
app.MapGet("/health", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow });

app.Run();