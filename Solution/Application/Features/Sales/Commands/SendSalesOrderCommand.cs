using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record SendSalesOrderCommand(Guid Id, string? To = null, string? Subject = null, string? Body = null) : IRequest<bool>;

public class SendSalesOrderCommandHandler : IRequestHandler<SendSalesOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public SendSalesOrderCommandHandler(IApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<bool> Handle(SendSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var so = await _context.SalesOrders
            .Include(e => e.Customer)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (so == null) throw new Exception("Sales Order not found.");

        // Ensure token exists
        if (so.PublicViewToken == null)
        {
            so.PublicViewToken = Guid.NewGuid();
            // Don't save yet, will save at the end
        }
        
        // Update Sent Metadata
        so.SentAt = DateTime.UtcNow;

        // Generate Public Link
        var publicLink = $"http://localhost:5173/portal/salesorder/{so.PublicViewToken}";

        // Determine Email Content
        var toEmail = !string.IsNullOrWhiteSpace(request.To) ? request.To : (so.Customer.Email ?? "customer@example.com");
        var subject = !string.IsNullOrWhiteSpace(request.Subject) ? request.Subject : $"Sales Order #{so.OrderNumber}";
        
        string emailBody;
        if (!string.IsNullOrWhiteSpace(request.Body))
        {
             emailBody = request.Body;
        }
        else
        {
            // Default Template
             emailBody = $@"
            Dear {so.Customer.Name},
            
            Please review the Sales Order {so.OrderNumber} for amount {so.TotalAmount:C}.
            
            You can verify and approve the order here:
            {publicLink}
            
            Regards,
            Seller";
        }

        // Send Email
        await _emailService.SendEmailAsync(toEmail, subject, emailBody);

        // Save Changes (Token, LastSentAt, etc.)
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
