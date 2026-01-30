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

public record CreateEstimateCommand(CreateEstimateDto Dto) : IRequest<Guid>;

public class CreateEstimateCommandValidator : AbstractValidator<CreateEstimateCommand>
{
    public CreateEstimateCommandValidator()
    {
        RuleFor(v => v.Dto.CustomerId).NotEmpty();
        RuleFor(v => v.Dto.EstimateDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreateEstimateCommandHandler : IRequestHandler<CreateEstimateCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateEstimateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateEstimateCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Generate Estimate Number
        var count = await _context.Estimates.CountAsync(cancellationToken);
        var estimateNumber = $"EST-{(count + 1):D4}";

        var entity = new Estimate
        {
            EstimateNumber = estimateNumber,
            ReferenceNumber = dto.ReferenceNumber ?? string.Empty,
            CustomerId = dto.CustomerId,
            EstimateDate = dto.EstimateDate,
            ExpiryDate = dto.ExpiryDate,
            TermsAndConditions = dto.TermsAndConditions,
            CustomerNotes = dto.CustomerNotes,
            // Negotiation Flag
            NegotiationAllowed = request.Dto.NegotiationAllowed,
            PlaceOfSupply = dto.PlaceOfSupply,
            Salesperson = dto.Salesperson,
            ProjectName = dto.ProjectName,
            ShippingCharges = dto.ShippingCharges,
            Adjustment = dto.Adjustment,
            Status = EstimateStatus.Draft
        };

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

            entity.Items.Add(new EstimateItem
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                Rate = itemDto.Rate,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                Amount = amount
            });
        }

        entity.SubTotal = entity.Items.Sum(x => x.Quantity * x.Rate);
        entity.TaxAmount = dto.TaxAmount ?? entity.Items.Sum(x => x.TaxAmount);
        entity.TotalAmount = entity.SubTotal + entity.TaxAmount + entity.ShippingCharges + entity.Adjustment;

        _context.Estimates.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
