using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Identity;
using CompreoBooks.Domain.Entities.Masters;
using CompreoBooks.Domain.Entities.AI;
using CompreoBooks.Domain.Entities.Sales;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Purchase;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace CompreoBooks.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public async Task DeleteEstimateItemsByEstimateIdAsync(Guid estimateId, CancellationToken cancellationToken)
    {
        await EstimateItems.Where(x => x.EstimateId == estimateId).ExecuteDeleteAsync(cancellationToken);
    }

    public async Task DeleteSalesOrderItemsBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken)
    {
        await SalesOrderItems.Where(x => x.SalesOrderId == salesOrderId).ExecuteDeleteAsync(cancellationToken);
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Domain.Entities.Audit.AuditLog> AuditLogs { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Party> Parties { get; set; }
    public DbSet<ContactPerson> ContactPersons { get; set; }
    public DbSet<Item> Items { get; set; }
    
    public DbSet<Estimate> Estimates { get; set; }
    public DbSet<EstimateItem> EstimateItems { get; set; }
    public DbSet<EstimateActivityLog> EstimateActivityLogs { get; set; }
    public DbSet<EstimateVersion> EstimateVersions { get; set; }

    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseRequest> PurchaseRequests { get; set; }
    public DbSet<PurchaseRequestItem> PurchaseRequestItems { get; set; }

    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
    public DbSet<Grn> Grns { get; set; }
    public DbSet<GrnItem> GrnItems { get; set; }
    public DbSet<Bill> Bills { get; set; }
    public DbSet<BillLine> BillLines { get; set; }
    public DbSet<DebitNote> DebitNotes { get; set; }
    public DbSet<DebitNoteLine> DebitNoteLines { get; set; }

    public DbSet<Receipt> Receipts { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<JournalEntry> JournalEntries { get; set; }
    public DbSet<JournalEntryLine> JournalEntryLines { get; set; }
    public DbSet<ContraEntry> ContraEntries { get; set; }
    public DbSet<ContraEntryLine> ContraEntryLines { get; set; }
    public DbSet<BankReconciliation> BankReconciliations { get; set; }
    public DbSet<BankReconciliationItem> BankReconciliationItems { get; set; }
    
    public DbSet<TaxCode> TaxCodes { get; set; }
    public DbSet<TdsCategory> TdsCategories { get; set; }
    public DbSet<PaymentTerm> PaymentTerms { get; set; }
    public DbSet<NumberingSeries> NumberingSeries { get; set; }
    public DbSet<InvoiceTemplate> InvoiceTemplates { get; set; }

    public DbSet<RagDocument> RagDocuments { get; set; }
    public DbSet<AiChatLog> AiChatLogs { get; set; }
    public DbSet<InvoiceExtractionLog> InvoiceExtractionLogs { get; set; }
    
    public DbSet<SalesOrder> SalesOrders { get; set; }
    public DbSet<SalesOrderItem> SalesOrderItems { get; set; }
    public DbSet<DeliveryChallan> DeliveryChallans { get; set; }
    public DbSet<DeliveryChallanLine> DeliveryChallanLines { get; set; }
    public DbSet<CreditNote> CreditNotes { get; set; }
    public DbSet<CreditNoteLine> CreditNoteLines { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceLine> InvoiceLines { get; set; }
    
    public DbSet<RecurringInvoice> RecurringInvoices { get; set; }
    public DbSet<RecurringInvoiceItem> RecurringInvoiceItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Permissions).HasDefaultValueSql("'{}'");
        });
    }
}
