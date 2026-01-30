using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public class SubmitNegotiationCommand : IRequest<Unit>
{
    public Guid EstimateId { get; set; }
    public string PublicToken { get; set; } = string.Empty;
    public CreateEstimateDto ProposedEstimate { get; set; } = null!;

    public SubmitNegotiationCommand(Guid estimateId, string publicToken, CreateEstimateDto proposed)
    {
        EstimateId = estimateId;
        PublicToken = publicToken;
        ProposedEstimate = proposed;
    }
}

public class SubmitNegotiationCommandHandler : IRequestHandler<SubmitNegotiationCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public SubmitNegotiationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(SubmitNegotiationCommand request, CancellationToken cancellationToken)
    {
        var estimate = await _context.Estimates
            .Include(e => e.Items)
            .FirstOrDefaultAsync(e => e.Id == request.EstimateId, cancellationToken);
            
        if (estimate == null) throw new Exception("Estimate not found");
        
        // Verify Token
        if (estimate.PublicViewToken?.ToString() != request.PublicToken)
            throw new Exception("Invalid Public Token");

        if (!estimate.NegotiationAllowed)
            throw new Exception("Negotiation is not allowed for this estimate.");

        // 1. Create Snapshot of Current (Base/Seller) Version
        var deepCopyItems = estimate.Items.Select(i => new
        {
            i.ItemId, i.Description, i.Quantity, i.Rate, i.TaxRate, i.TaxAmount, i.Amount
        }).ToList();
        
        var snapshot = new
        {
            estimate.SubTotal, estimate.TaxAmount, estimate.TotalAmount,
            estimate.TermsAndConditions, estimate.CustomerNotes,
            estimate.Adjustment, estimate.ShippingCharges,
            Items = deepCopyItems
        };

        var latestVersion = await _context.EstimateVersions
            .Where(v => v.EstimateId == estimate.Id)
            .OrderByDescending(v => v.VersionNumber)
            .FirstOrDefaultAsync(cancellationToken);
        
        int nextVersion = (latestVersion?.VersionNumber ?? 0) + 1;

        var versionEntity = new EstimateVersion
        {
            EstimateId = estimate.Id,
            VersionNumber = nextVersion,
            SnapshotJson = JsonSerializer.Serialize(snapshot),
            CreatedBy = "Seller", // The "Before" state was created by Seller
            CreatedAt = DateTime.UtcNow
        };
        _context.EstimateVersions.Add(versionEntity);

        // 2. Apply Customer's Negotiation Changes
        var dto = request.ProposedEstimate;
        
        // Update Header
        estimate.CustomerRemarks = dto.CustomerRemarks;
        estimate.Status = EstimateStatus.NegotiationRequested;
        
        // We only allow customer to change Items, Adjustment, CustomerRemarks.
        // We usually don't allow them to change Terms, Notes, etc.
        
        // Using the safe delete method we implemented earlier
        await _context.SaveChangesAsync(cancellationToken); // Save Version first
        await _context.DeleteEstimateItemsByEstimateIdAsync(estimate.Id, cancellationToken);
        
        estimate.Items.Clear();

        decimal subTotal = 0;
        decimal totalTax = 0;

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

            var newItem = new EstimateItem
            {
                EstimateId = estimate.Id,
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                Rate = itemDto.Rate,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                Amount = amount
            };
            _context.EstimateItems.Add(newItem);
            
            subTotal += (itemDto.Quantity * itemDto.Rate);
            totalTax += taxAmount;
        }

        estimate.SubTotal = subTotal;
        estimate.TaxAmount = totalTax;
        estimate.TotalAmount = subTotal + totalTax + estimate.ShippingCharges + estimate.Adjustment;

        // BaseEstimateId logic: If this is the FIRST negotiation, the Base is the original ID. 
        // Logic: The "Base" is always the ORIGINAL estimate ID. 
        // If we want to track the chain, we rely on EstimateVersions.
        
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
