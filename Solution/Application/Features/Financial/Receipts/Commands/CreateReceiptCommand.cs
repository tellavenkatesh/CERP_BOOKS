using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using MediatR;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Receipts.Commands;

public record CreateReceiptCommand : IRequest<Guid>
{
    public DateTime ReceiptDate { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

public class CreateReceiptCommandValidator : AbstractValidator<CreateReceiptCommand>
{
    public CreateReceiptCommandValidator()
    {
        RuleFor(v => v.CustomerId).NotEmpty();
        RuleFor(v => v.Amount).GreaterThan(0);
        RuleFor(v => v.ReceiptDate).NotEmpty();
    }
}

public class CreateReceiptCommandHandler : IRequestHandler<CreateReceiptCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateReceiptCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateReceiptCommand request, CancellationToken cancellationToken)
    {
        // Generate Receipt Number
        var count = await _context.Receipts.CountAsync(cancellationToken) + 1;
        var receiptNumber = $"RCT-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";
        
        // Ensure uniqueness
        while (await _context.Receipts.AnyAsync(r => r.ReceiptNumber == receiptNumber, cancellationToken))
        {
            count++;
            receiptNumber = $"RCT-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";
        }

        var entity = new Receipt
        {
            ReceiptDate = request.ReceiptDate.ToUniversalTime(),
            CustomerId = request.CustomerId,
            Amount = request.Amount,
            PaymentMode = request.PaymentMode,
            ReferenceNumber = request.ReferenceNumber,
            Notes = request.Notes,
            ReceiptNumber = receiptNumber
        };

        _context.Receipts.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
