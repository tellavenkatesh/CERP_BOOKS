using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands.RespondToEstimate;

public enum EstimateResponseAction
{
    Accept = 0,
    Decline = 1
}

public record RespondToEstimateCommand(Guid Token, EstimateResponseAction Action, string? Reason) : IRequest<bool>;

public class RespondToEstimateCommandHandler : IRequestHandler<RespondToEstimateCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RespondToEstimateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RespondToEstimateCommand request, CancellationToken cancellationToken)
    {
        var estimate = await _context.Estimates
            .FirstOrDefaultAsync(e => e.PublicViewToken == request.Token, cancellationToken);

        if (estimate == null)
            throw new Exception("Invalid estimate token.");

        if (estimate.Status != EstimateStatus.Sent && estimate.Status != EstimateStatus.Draft) 
        {
            // Allow response if Sent or Draft (Sent status usually implies it's out there)
            // But if already Accepted/Declined, maybe block updates?
            // User requirement: "Old estimate stays Declined... New estimate fresh lifecycle".
            // So if it's already decided, we shouldn't change it.
             if (estimate.Status == EstimateStatus.Accepted || estimate.Status == EstimateStatus.Declined || estimate.Status == EstimateStatus.ConvertedToOrder || estimate.Status == EstimateStatus.Expired)
             {
                 throw new Exception("Estimate has already been processed.");
             }
        }

        if (request.Action == EstimateResponseAction.Accept)
        {
            estimate.Status = EstimateStatus.Accepted;
            estimate.AcceptedAt = DateTime.UtcNow;
            
            _context.EstimateActivityLogs.Add(new EstimateActivityLog
            {
                EstimateId = estimate.Id,
                ActivityType = EstimateActivityType.Accepted,
                Description = "Customer accepted the estimate.",
                Timestamp = DateTime.UtcNow
            });
        }
        else if (request.Action == EstimateResponseAction.Decline)
        {
            estimate.Status = EstimateStatus.Declined;
            estimate.DeclinedAt = DateTime.UtcNow;
            estimate.DeclineReason = request.Reason;

            _context.EstimateActivityLogs.Add(new EstimateActivityLog
            {
                EstimateId = estimate.Id,
                ActivityType = EstimateActivityType.Declined,
                Description = $"Customer declined the estimate. Reason: {request.Reason}",
                Timestamp = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
