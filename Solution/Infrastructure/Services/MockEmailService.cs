using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CompreoBooks.Infrastructure.Services;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation("================ MOCK EMAIL SENT ================");
        _logger.LogInformation($"To: {to}");
        _logger.LogInformation($"Subject: {subject}");
        _logger.LogInformation($"Body: {body}");
        _logger.LogInformation("=================================================");
        
        return Task.CompletedTask;
    }

    public Task SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentData, string attachmentName)
    {
        _logger.LogInformation("================ MOCK EMAIL WITH ATTACHMENT SENT ================");
        _logger.LogInformation($"To: {to}");
        _logger.LogInformation($"Subject: {subject}");
        _logger.LogInformation($"Attachment: {attachmentName} ({attachmentData?.Length ?? 0} bytes)");
        _logger.LogInformation($"Body: {body}");
        _logger.LogInformation("=================================================");

        return Task.CompletedTask;
    }
}
