using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MimeKit;

namespace CompreoBooks.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var host = emailSettings["Host"];
        var port = int.Parse(emailSettings["Port"]);
        var fromEmail = emailSettings["FromEmail"];
        var password = emailSettings["Password"]?.Replace(" ", "");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Compreo Books", fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        message.Body = new TextPart("plain")
        {
            Text = body
        };

        using var client = new SmtpClient();
        try
        {
            // Connect to the server
            // For Gmail: smtp.gmail.com, 587, SecureSocketOptions.StartTls
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);

            // Authenticate
            await client.AuthenticateAsync(fromEmail, password);

            // Send
            await client.SendAsync(message);
            
            _logger.LogInformation($"Email sent to {to} successfully.");
            
            await client.DisconnectAsync(true);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {to}");
            throw;
        }
    }
    public async Task SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentData, string attachmentName)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var host = emailSettings["Host"];
        var port = int.Parse(emailSettings["Port"]);
        var fromEmail = emailSettings["FromEmail"];
        var password = emailSettings["Password"]?.Replace(" ", "");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Compreo Books", fromEmail));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder
        {
            TextBody = body
        };

        if (attachmentData != null && attachmentData.Length > 0)
        {
            bodyBuilder.Attachments.Add(attachmentName, attachmentData);
        }

        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(fromEmail, password);
            await client.SendAsync(message);
            _logger.LogInformation($"Email with attachment sent to {to} successfully.");
            await client.DisconnectAsync(true);
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {to}");
            throw;
        }
    }
}
