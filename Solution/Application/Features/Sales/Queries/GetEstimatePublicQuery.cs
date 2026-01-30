using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetEstimatePublicQuery(Guid Token) : IRequest<EstimateDto?>;

public class GetEstimatePublicQueryHandler : IRequestHandler<GetEstimatePublicQuery, EstimateDto?>
{
    private readonly IApplicationDbContext _context;

    public GetEstimatePublicQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EstimateDto?> Handle(GetEstimatePublicQuery request, CancellationToken cancellationToken)
    {
        var estimate = await _context.Estimates
            .Include(e => e.Customer)
            .Include(e => e.Items)
            .ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(e => e.PublicViewToken == request.Token, cancellationToken);

        if (estimate == null) return null;

        // Log Viewed Activity (check if recent view exists to avoid spam?)
        // For simplicity, log every view for now or maybe skip if recently viewed.
        // Also, this query is likely called by the customer, so we should log it.
        // Ideally we'd get IP from request, but here we are in Application layer.
        
        var activity = new EstimateActivityLog
        {
            EstimateId = estimate.Id,
            ActivityType = EstimateActivityType.Viewed,
            Description = "Customer viewed the estimate online.",
            Timestamp = DateTime.UtcNow
        };
        _context.EstimateActivityLogs.Add(activity);
        
        // Update estimate ViewedAt if first time
        if (estimate.ViewedAt == null)
        {
            estimate.ViewedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Map to DTO
        return new EstimateDto
        {
            Id = estimate.Id,
            EstimateNumber = estimate.EstimateNumber,
            EstimateDate = estimate.EstimateDate,
            ExpiryDate = estimate.ExpiryDate,
            CustomerId = estimate.CustomerId,
            CustomerName = estimate.Customer.Name, // Assuming Party has Name
            SubTotal = estimate.SubTotal,
            TaxAmount = estimate.TaxAmount,
            TotalAmount = estimate.TotalAmount,
            Status = estimate.Status.ToString(),
            ApprovalStatus = estimate.ApprovalStatus.ToString(),
            TermsAndConditions = estimate.TermsAndConditions,
            CustomerNotes = estimate.CustomerNotes,
            PublicViewToken = estimate.PublicViewToken,
            NegotiationAllowed = estimate.NegotiationAllowed,
            CustomerRemarks = estimate.CustomerRemarks,
            Items = estimate.Items.Select(i => new EstimateItemDto
            {
                Id = i.Id,
                ItemId = i.ItemId,
                ItemName = i.Item.Name,
                Description = i.Description,
                Quantity = i.Quantity,
                Rate = i.Rate,
                TaxRate = i.TaxRate,
                TaxAmount = i.TaxAmount,
                Amount = i.Amount
            }).ToList()
        };
    }
}
