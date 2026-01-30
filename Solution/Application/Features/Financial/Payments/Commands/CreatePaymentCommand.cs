using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Purchase;
using CompreoBooks.Application.Features.Financial.Payments.DTOs;
using MediatR;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Payments.Commands;

public record CreatePaymentCommand(CreatePaymentDto Dto) : IRequest<Guid>;

public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    public CreatePaymentCommandValidator()
    {
        RuleFor(v => v.Dto.VendorId).NotEmpty();
        RuleFor(v => v.Dto.Amount).GreaterThan(0);
        RuleFor(v => v.Dto.PaymentDate).NotEmpty();
    }
}

public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreatePaymentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Generate Payment Number
        var count = await _context.Payments.CountAsync(cancellationToken) + 1;
        var paymentNumber = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";
        while (await _context.Payments.AnyAsync(r => r.PaymentNumber == paymentNumber, cancellationToken))
        {
            count++;
            paymentNumber = $"PAY-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";
        }

        var entity = new Payment
        {
            PaymentDate = dto.PaymentDate.ToUniversalTime(),
            VendorId = dto.VendorId,
            Amount = dto.Amount,
            PaymentMode = dto.PaymentMode,
            ReferenceNumber = dto.ReferenceNumber,
            Notes = dto.Notes,
            PaymentNumber = paymentNumber,
            BillId = dto.BillId
        };

        if (dto.BillId.HasValue)
        {
            var bill = await _context.Bills.FindAsync(new object[] { dto.BillId.Value }, cancellationToken);
            if (bill != null)
            {
                // Update Bill Payment Status
                bill.PaidAmount += dto.Amount;
                
                // Balance is computed property (NetPayable - PaidAmount), so no need to set it.
                // We just check the value.
                
                if (bill.BalanceAmount <= 0.01m) // Tolerance for float issues
                {
                    bill.Status = BillStatus.Paid;
                }
                else
                {
                    bill.Status = BillStatus.PartiallyPaid; 
                }
                
                entity.BillNumber = bill.BillNumber;
            }
        }

        _context.Payments.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
