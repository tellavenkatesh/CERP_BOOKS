using CompreoBooks.Domain.Entities.Identity;
using CompreoBooks.Domain.Entities.Masters;
using CompreoBooks.Domain.Entities.AI;
using CompreoBooks.Domain.Entities.Sales;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Purchase;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Domain.Entities.Audit.AuditLog> AuditLogs { get; }
    DbSet<Company> Companies { get; }
    DbSet<Account> Accounts { get; }
    DbSet<Party> Parties { get; }
    DbSet<Item> Items { get; }
    DbSet<RagDocument> RagDocuments { get; }
    DbSet<AiChatLog> AiChatLogs { get; }
    DbSet<InvoiceExtractionLog> InvoiceExtractionLogs { get; }
    
    DbSet<SalesOrder> SalesOrders { get; }
    DbSet<SalesOrderItem> SalesOrderItems { get; }
    DbSet<DeliveryChallan> DeliveryChallans { get; }
    DbSet<DeliveryChallanLine> DeliveryChallanLines { get; }
    DbSet<CreditNote> CreditNotes { get; }
    DbSet<CreditNoteLine> CreditNoteLines { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceLine> InvoiceLines { get; }
    
    DbSet<RecurringInvoice> RecurringInvoices { get; }
    DbSet<RecurringInvoiceItem> RecurringInvoiceItems { get; }
    DbSet<Estimate> Estimates { get; }
    DbSet<EstimateItem> EstimateItems { get; }
    DbSet<EstimateActivityLog> EstimateActivityLogs { get; }
    DbSet<EstimateVersion> EstimateVersions { get; }
    
    DbSet<PurchaseOrder> PurchaseOrders { get; }
    DbSet<PurchaseOrderItem> PurchaseOrderItems { get; }
    DbSet<PurchaseRequest> PurchaseRequests { get; }
    DbSet<PurchaseRequestItem> PurchaseRequestItems { get; }
    DbSet<Grn> Grns { get; }
    DbSet<GrnItem> GrnItems { get; }
    DbSet<Bill> Bills { get; }
    DbSet<BillLine> BillLines { get; }
    DbSet<DebitNote> DebitNotes { get; }
    DbSet<DebitNoteLine> DebitNoteLines { get; }

    DbSet<Receipt> Receipts { get; }
    DbSet<Payment> Payments { get; }
    DbSet<JournalEntry> JournalEntries { get; }
    DbSet<JournalEntryLine> JournalEntryLines { get; }
    DbSet<ContraEntry> ContraEntries { get; }
    DbSet<ContraEntryLine> ContraEntryLines { get; }
    DbSet<BankReconciliation> BankReconciliations { get; }
    DbSet<BankReconciliationItem> BankReconciliationItems { get; }
    DbSet<TaxCode> TaxCodes { get; }
    DbSet<TdsCategory> TdsCategories { get; }
    DbSet<PaymentTerm> PaymentTerms { get; }
    DbSet<NumberingSeries> NumberingSeries { get; }
    DbSet<InvoiceTemplate> InvoiceTemplates { get; }

    Task DeleteEstimateItemsByEstimateIdAsync(Guid estimateId, CancellationToken cancellationToken);
    Task DeleteSalesOrderItemsBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
