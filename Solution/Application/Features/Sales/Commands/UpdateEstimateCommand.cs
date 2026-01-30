using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record UpdateEstimateCommand(Guid Id, CreateEstimateDto Dto) : IRequest;

public class UpdateEstimateCommandValidator : AbstractValidator<UpdateEstimateCommand>
{
    public UpdateEstimateCommandValidator()
    {
        RuleFor(v => v.Dto.CustomerId).NotEmpty();
        RuleFor(v => v.Dto.EstimateDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class UpdateEstimateCommandHandler : IRequestHandler<UpdateEstimateCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateEstimateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateEstimateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = await _context.Estimates
                .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

            if (entity == null)
            {
                throw new Exception("Estimate not found");
            }

            var dto = request.Dto;

            // 1. Update Parent Fields
            entity.ReferenceNumber = dto.ReferenceNumber ?? string.Empty;
            entity.CustomerId = dto.CustomerId;
            entity.EstimateDate = dto.EstimateDate;
            entity.ExpiryDate = dto.ExpiryDate;
            entity.TermsAndConditions = dto.TermsAndConditions;
            entity.CustomerNotes = dto.CustomerNotes;
            
            // Negotiation Flag
            entity.NegotiationAllowed = dto.NegotiationAllowed;

            entity.PlaceOfSupply = dto.PlaceOfSupply;
            entity.Salesperson = dto.Salesperson;
            entity.ProjectName = dto.ProjectName;
            entity.ShippingCharges = dto.ShippingCharges;
            entity.Adjustment = dto.Adjustment;

            // SAVE PARENT FIRST to avoid concurrency confusion
            await _context.SaveChangesAsync(cancellationToken);

            // 2. Delete Old Items (Safe ExecuteDelete)
            await _context.DeleteEstimateItemsByEstimateIdAsync(request.Id, cancellationToken);
            
            // 3. Add New Items
            // Re-fetch or restart tracking for items isn't needed if we stick to the context
            if (entity.Items == null) entity.Items = new List<EstimateItem>();
            else entity.Items.Clear(); // Just to be locally consistent

            decimal subTotal = 0;
            decimal totalTax = 0;

            foreach (var itemDto in dto.Items)
            {
                var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
                var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

                var newItem = new EstimateItem
                {
                    EstimateId = entity.Id,
                    ItemId = itemDto.ItemId,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    Rate = itemDto.Rate,
                    TaxRate = itemDto.TaxRate,
                    TaxAmount = taxAmount,
                    Amount = amount
                };
                
                // Add directly to DbContext to be explicit
                _context.EstimateItems.Add(newItem);

                subTotal += (itemDto.Quantity * itemDto.Rate);
                totalTax += taxAmount;
            }

            // 4. Update Totals on Parent
            entity.SubTotal = subTotal;
            entity.TaxAmount = dto.TaxAmount ?? totalTax;
            entity.TotalAmount = subTotal + totalTax + entity.ShippingCharges + entity.Adjustment;

            // FINAL SAVE
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] UpdateEstimate failed: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[ERROR] Inner Exception: {ex.InnerException.Message}");
            }
            throw;
        }
    }
}
