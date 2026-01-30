using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Sales.Commands;

public class CreateRecurringInvoiceDto
{
    public string ProfileName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string RecurringInterval { get; set; } = "Monthly"; // Daily, Weekly, Monthly...
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? PaymentTerms { get; set; }
    public List<CreateRecurringInvoiceItemDto> Items { get; set; } = new();
}

public class CreateRecurringInvoiceItemDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; } // UnitPrice
    public decimal TaxRate { get; set; }
}

public record CreateRecurringInvoiceCommand(CreateRecurringInvoiceDto Dto) : IRequest<Guid>;

public class CreateRecurringInvoiceCommandValidator : AbstractValidator<CreateRecurringInvoiceCommand>
{
    public CreateRecurringInvoiceCommandValidator()
    {
        RuleFor(v => v.Dto.ProfileName).NotEmpty();
        RuleFor(v => v.Dto.CustomerId).NotEmpty();
        RuleFor(v => v.Dto.StartDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreateRecurringInvoiceCommandHandler : IRequestHandler<CreateRecurringInvoiceCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateRecurringInvoiceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateRecurringInvoiceCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        if (!Enum.TryParse<RecurringInterval>(dto.RecurringInterval, true, out var interval))
        {
            interval = RecurringInterval.Monthly;
        }

        var entity = new RecurringInvoice
        {
            ProfileName = dto.ProfileName,
            CustomerId = dto.CustomerId,
            Interval = interval,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            NextRunDate = dto.StartDate, // First run date
            Status = RecurringStatus.Active,
            PaymentTerms = dto.PaymentTerms ?? string.Empty
        };

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

            entity.Items.Add(new RecurringInvoiceItem
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

        entity.TotalAmount = entity.Items.Sum(x => x.Amount);

        _context.RecurringInvoices.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
