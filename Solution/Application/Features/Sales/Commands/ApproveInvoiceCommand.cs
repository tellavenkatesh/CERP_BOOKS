using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Masters;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record ApproveInvoiceCommand(Guid Id) : IRequest<bool>;

public class ApproveInvoiceCommandHandler : IRequestHandler<ApproveInvoiceCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;

    public ApproveInvoiceCommandHandler(IApplicationDbContext context, IPublisher publisher)
    {
        _context = context;
        _publisher = publisher;
    }

    public async Task<bool> Handle(ApproveInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .Include(x => x.Customer)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (invoice == null) return false;

        if (invoice.Status != InvoiceStatus.Draft) return false; // Already processed

        // 1. Identify Accounts
        // 1. Identify Accounts - Auto-create if missing (Self-Healing)
        
        // Receivable Account (Asset)
        var receivableAccount = await _context.Accounts
            .FirstOrDefaultAsync(x => x.Name == "Accounts Receivable" || x.Code == "1100", cancellationToken);
        
        if (receivableAccount == null)
        {
             receivableAccount = new Account 
             { 
                 Name = "Accounts Receivable", 
                 Code = "1100", 
                 Type = AccountType.Asset, 
                 IsSystem = true,
                 Description = "System generated account for Receivables"
             };
             _context.Accounts.Add(receivableAccount);
        }

        // Sales Account (Income)
        var salesAccount = await _context.Accounts
            .FirstOrDefaultAsync(x => x.Name == "Sales" || x.Code == "4000", cancellationToken);
            
        if (salesAccount == null)
        {
             salesAccount = new Account 
             { 
                 Name = "Sales", 
                 Code = "4000", 
                 Type = AccountType.Income, 
                 IsSystem = true, 
                 Description = "System generated account for Sales Revenue"
             };
             _context.Accounts.Add(salesAccount);
        }

        // Tax Account (Liability)
        var taxAccount = await _context.Accounts
            .FirstOrDefaultAsync(x => x.Name == "Duties and Taxes" || x.Code == "2100", cancellationToken);
            
        if (taxAccount == null && invoice.TaxAmount > 0)
        {
             taxAccount = new Account 
             { 
                 Name = "Duties and Taxes", 
                 Code = "2100", 
                 Type = AccountType.Liability, 
                 IsSystem = true, 
                 Description = "System generated account for Taxes"
             };
             _context.Accounts.Add(taxAccount);
        }
        
        // Ensure new accounts are tracked (though Add does it, explicit check for ID safety if needed, mostly fine in EF Core)


        // 2. Create Journal Entry
        var je = new JournalEntry
        {
            JournalDate = invoice.InvoiceDate,
            Narration = $"Invoice #{invoice.InvoiceNumber} - {invoice.Customer.Name}",
            Status = JournalEntryStatus.Posted
        };
        
        // Debit Customer (Total)
        je.Lines.Add(new JournalEntryLine
        {
            AccountId = receivableAccount.Id,
            PartyId = invoice.CustomerId,
            DebitAmount = invoice.TotalAmount,
            CreditAmount = 0,
            Description = "Invoice Total"
        });

        // Credit Sales (SubTotal)
        je.Lines.Add(new JournalEntryLine
        {
            AccountId = salesAccount.Id,
            DebitAmount = 0,
            CreditAmount = invoice.SubTotal,
            Description = "Sales Revenue"
        });

        // Credit Tax (TaxAmount)
        if (invoice.TaxAmount > 0 && taxAccount != null)
        {
            je.Lines.Add(new JournalEntryLine
            {
                AccountId = taxAccount.Id,
                DebitAmount = 0,
                CreditAmount = invoice.TaxAmount,
                Description = "Tax Payable"
            });
        }

        // Generating JE Number (Simplified)
        var jeCount = await _context.JournalEntries.CountAsync(cancellationToken);
        je.JournalNumber = $"JE-{(jeCount + 1):D4}";

        _context.JournalEntries.Add(je);

        // 3. Update Invoice Status
        invoice.Status = InvoiceStatus.Posted;

        await _context.SaveChangesAsync(cancellationToken);
        
        // Publish Event for Email Automation
        await _publisher.Publish(new Events.InvoiceApprovedEvent(invoice.Id), cancellationToken);

        return true;
    }
}
