using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Commands;

public record CreateBankReconciliationCommand : IRequest<Guid>
{
    public Guid AccountId { get; set; }
    public DateTime StatementDate { get; set; }
    public decimal StatementBalance { get; set; }
    public List<ReconciledItemDto> ReconciledItems { get; set; } = new();
}

public class ReconciledItemDto
{
    public Guid TransactionId { get; set; }
    public string OriginalIdType { get; set; } = string.Empty; // "Payment", "Receipt", "ContraEntryLine"
    public DateTime TransactionDate { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class CreateBankReconciliationCommandValidator : AbstractValidator<CreateBankReconciliationCommand>
{
    public CreateBankReconciliationCommandValidator()
    {
        RuleFor(v => v.AccountId).NotEmpty();
        RuleFor(v => v.StatementDate).NotEmpty();
        RuleFor(v => v.ReconciledItems).NotNull();
    }
}

public class CreateBankReconciliationCommandHandler : IRequestHandler<CreateBankReconciliationCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBankReconciliationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateBankReconciliationCommand request, CancellationToken cancellationToken)
    {
        var entity = new BankReconciliation
        {
            AccountId = request.AccountId,
            StatementDate = request.StatementDate.ToUniversalTime(),
            StatementBalance = request.StatementBalance,
            ReconciledDate = DateTime.UtcNow
        };

        foreach (var item in request.ReconciledItems)
        {
            var recItem = new BankReconciliationItem
            {
                TransactionDate = item.TransactionDate.ToUniversalTime(), // Ensure item dates are also UTC if needed, though they come from DB usually. Safe to ensure.
                Amount = item.Amount,
                Description = item.Description
            };

            if (item.OriginalIdType == "Payment") recItem.PaymentId = item.TransactionId;
            else if (item.OriginalIdType == "Receipt") recItem.ReceiptId = item.TransactionId;
            else if (item.OriginalIdType == "ContraEntryLine") recItem.ContraEntryLineId = item.TransactionId;

            entity.Items.Add(recItem);
        }

        _context.BankReconciliations.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
