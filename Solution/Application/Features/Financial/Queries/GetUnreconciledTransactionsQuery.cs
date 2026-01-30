using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Queries;

public record GetUnreconciledTransactionsQuery(Guid AccountId) : IRequest<List<UnreconciledTransactionDto>>;

public class UnreconciledTransactionDto
{
    public Guid Id { get; set; } // The ID of the Payment/Receipt/Line
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; } // Positive for Deposit, Negative for Withdrawal? Or just Amount + Type
    public string Type { get; set; } = string.Empty; // Payment, Receipt, Contra
    public string OriginalIdType { get; set; } = string.Empty; // "Payment", "Receipt", "ContraEntryLine"
}

public class GetUnreconciledTransactionsQueryHandler : IRequestHandler<GetUnreconciledTransactionsQuery, List<UnreconciledTransactionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUnreconciledTransactionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UnreconciledTransactionDto>> Handle(GetUnreconciledTransactionsQuery request, CancellationToken cancellationToken)
    {
        var reconciledPaymentIds = _context.BankReconciliationItems
            .Where(x => x.PaymentId != null)
            .Select(x => x.PaymentId);

        var reconciledReceiptIds = _context.BankReconciliationItems
            .Where(x => x.ReceiptId != null)
            .Select(x => x.ReceiptId);
            
        var reconciledContraLineIds = _context.BankReconciliationItems
            .Where(x => x.ContraEntryLineId != null)
            .Select(x => x.ContraEntryLineId);

        var payments = await _context.Payments
            .Where(x => x.AccountId == request.AccountId && !reconciledPaymentIds.Contains(x.Id))
            .Select(x => new UnreconciledTransactionDto
            {
                Id = x.Id,
                Date = x.PaymentDate,
                Description = $"Payment to {x.Vendor.Name} ({x.PaymentNumber})",
                Amount = -x.Amount, // Withdrawal
                Type = "Payment",
                OriginalIdType = "Payment"
            })
            .ToListAsync(cancellationToken);

        var receipts = await _context.Receipts
            .Where(x => x.AccountId == request.AccountId && !reconciledReceiptIds.Contains(x.Id))
            .Select(x => new UnreconciledTransactionDto
            {
                Id = x.Id,
                Date = x.ReceiptDate,
                Description = $"Receipt from {x.Customer.Name} ({x.ReceiptNumber})",
                Amount = x.Amount, // Deposit
                Type = "Receipt",
                OriginalIdType = "Receipt"
            })
            .ToListAsync(cancellationToken);
            
        var contraLines = await _context.ContraEntryLines
            .Include(x => x.ContraEntry)
            .Where(x => x.AccountId == request.AccountId && !reconciledContraLineIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        var contraDtos = contraLines.Select(x => new UnreconciledTransactionDto
        {
            Id = x.Id,
            Date = x.ContraEntry.ContraDate,
            Description = $"Contra: {x.ContraEntry.ContraNumber} - {x.Description}",
            Amount = x.Type == ContraType.Debit ? x.Amount : -x.Amount, // Debit to Bank = Deposit? 
            // In accounting: Bank Debit = Increment (Deposit), Bank Credit = Decrement (Withdrawal)
            // If Type is Debit, it increases the asset (Bank). So positive.
            Type = "Contra",
            OriginalIdType = "ContraEntryLine"
        }).ToList();

        return payments.Concat(receipts).Concat(contraDtos).OrderBy(x => x.Date).ToList();
    }
}
