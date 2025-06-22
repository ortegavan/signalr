namespace backend.Models
{
    public class Message
    {
        public string Body { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}