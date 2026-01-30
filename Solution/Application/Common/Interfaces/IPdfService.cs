using CompreoBooks.Domain.Entities.Purchase;
using CompreoBooks.Domain.Entities.Sales;

namespace CompreoBooks.Application.Common.Interfaces;

public interface IPdfService
{
    byte[] GenerateInvoicePdf(Invoice invoice);
    byte[] GeneratePurchaseOrderPdf(PurchaseOrder purchaseOrder);
}
