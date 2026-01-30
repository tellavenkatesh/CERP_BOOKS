using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.Events;

namespace CompreoBooks.Application.Features.Sales.EventHandlers;

public class InvoiceApprovedEventHandler : INotificationHandler<InvoiceApprovedEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;
    private readonly ILogger<InvoiceApprovedEventHandler> _logger;

    public InvoiceApprovedEventHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IPdfService pdfService,
        ILogger<InvoiceApprovedEventHandler> logger)
    {
        _context = context;
        _emailService = emailService;
        _pdfService = pdfService;
        _logger = logger;
    }

    public async Task Handle(InvoiceApprovedEvent notification, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == notification.InvoiceId, cancellationToken);

        if (invoice == null)
        {
            _logger.LogWarning($"Invoice {notification.InvoiceId} not found for email generation.");
            return;
        }

        if (string.IsNullOrEmpty(invoice.Customer?.Email))
        {
            _logger.LogWarning($"Customer for Invoice {invoice.InvoiceNumber} has no email.");
            return;
        }

        try
        {
            var pdfBytes = _pdfService.GenerateInvoicePdf(invoice);
            var subject = $"Invoice #{invoice.InvoiceNumber} from Compreo Books";
            var body = $"Dear {invoice.Customer.DisplayName},\n\nPlease find attached invoice #{invoice.InvoiceNumber}.\n\nTotal Amount: {invoice.TotalAmount:C}\nDue Date: {invoice.DueDate:d}\n\nThank you for your business!";

            await _emailService.SendEmailWithAttachmentAsync(
                invoice.Customer.Email,
                subject,
                body,
                pdfBytes,
                $"Invoice_{invoice.InvoiceNumber}.pdf"
            );

            _logger.LogInformation($"Invoice {invoice.InvoiceNumber} emailed to {invoice.Customer.Email}");
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, $"Failed to generate/send invoice email for {invoice.InvoiceNumber}");
        }
    }
}
