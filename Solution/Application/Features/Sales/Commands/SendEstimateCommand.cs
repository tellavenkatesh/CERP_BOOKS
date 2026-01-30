using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands.SendEstimate;

public record SendEstimateCommand(Guid EstimateId) : IRequest<bool>;

public class SendEstimateCommandHandler : IRequestHandler<SendEstimateCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public SendEstimateCommandHandler(IApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<bool> Handle(SendEstimateCommand request, CancellationToken cancellationToken)
    {
        var estimate = await _context.Estimates
            .Include(e => e.Customer)
            .FirstOrDefaultAsync(e => e.Id == request.EstimateId, cancellationToken);

        if (estimate == null)
            throw new Exception("Estimate not found.");

        // 1. Generate Public Token if missing
        if (estimate.PublicViewToken == null)
        {
            estimate.PublicViewToken = Guid.NewGuid();
        }

        // 2. Update Status
        estimate.Status = EstimateStatus.Sent;
        estimate.SentAt = DateTime.UtcNow;

        // 3. Log Activity
        var activityHandler = new EstimateActivityLog
        {
            EstimateId = estimate.Id,
            ActivityType = EstimateActivityType.Sent,
            Description = $"Estimate sent to {estimate.Customer.Email}", // Assuming Party has Email
            Timestamp = DateTime.UtcNow
        };
        _context.EstimateActivityLogs.Add(activityHandler);

        // 4. Send Email (Mock)
        var publicLink = $"http://localhost:5173/portal/estimate/{estimate.PublicViewToken}"; // Frontend URL
        var emailBody = $@"
            Dear {estimate.Customer.Name},
            
            Please find your estimate {estimate.EstimateNumber} for amount {estimate.TotalAmount:C}.
            
            You can view, accept, or decline the estimate here:
            {publicLink}
            
            Regards,
            Seller";

        await _emailService.SendEmailAsync(estimate.Customer.Email ?? "customer@example.com", $"Estimate #{estimate.EstimateNumber}", emailBody);

        await _context.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
