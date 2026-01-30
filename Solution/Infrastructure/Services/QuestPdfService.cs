using System;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using CompreoBooks.Domain.Entities.Sales;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CompreoBooks.Infrastructure.Services;

public class QuestPdfService : IPdfService
{
    public QuestPdfService()
    {
        // Set License Key (Community)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateInvoicePdf(Invoice invoice)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text($"Invoice #{invoice.InvoiceNumber}").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                            column.Item().Text($"Date: {invoice.InvoiceDate:dd MMM yyyy}");
                            column.Item().Text($"Due Date: {invoice.DueDate:dd MMM yyyy}");
                        });

                        row.ConstantItem(100).Height(50).Placeholder(); // Logo Placeholder
                    });

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        // Customer Details
                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Column(custCol =>
                            {
                                custCol.Item().Text("Bill To:").Bold();
                                custCol.Item().Text(invoice.Customer?.DisplayName ?? "Customer");
                                if (!string.IsNullOrEmpty(invoice.Customer?.BillingAddress))
                                    custCol.Item().Text(invoice.Customer.BillingAddress);
                            });
                        });
                        
                        column.Item().PaddingVertical(5);

                        // Table
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);
                                columns.RelativeColumn(3);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("#");
                                header.Cell().Element(CellStyle).Text("Item");
                                header.Cell().Element(CellStyle).AlignRight().Text("Rate");
                                header.Cell().Element(CellStyle).AlignRight().Text("Qty");
                                header.Cell().Element(CellStyle).AlignRight().Text("Total");

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                                }
                            });

                            foreach (var item in invoice.Items)
                            {
                                table.Cell().Element(CellStyle).Text("1"); // Index not available easily in foreach
                                table.Cell().Element(CellStyle).Text(item.Description ?? "Item");
                                table.Cell().Element(CellStyle).AlignRight().Text($"{item.Rate:N2}");
                                table.Cell().Element(CellStyle).AlignRight().Text($"{item.Quantity}");
                                table.Cell().Element(CellStyle).AlignRight().Text($"{item.Amount:N2}");

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(5);
                                }
                            }
                        });
                        
                        column.Item().PaddingVertical(10);

                        // Totals
                        column.Item().Row(row =>
                        {
                            row.RelativeItem(); // Spacer
                            row.ConstantItem(200).Column(col =>
                            {
                                col.Item().Row(r => { r.RelativeItem().Text("Sub Total:"); r.RelativeItem().AlignRight().Text($"{invoice.SubTotal:N2}"); });
                                col.Item().Row(r => { r.RelativeItem().Text("Tax Total:"); r.RelativeItem().AlignRight().Text($"{invoice.TaxAmount:N2}"); });
                                col.Item().Row(r => { r.RelativeItem().Text("Grand Total:").Bold(); r.RelativeItem().AlignRight().Text($"{invoice.TotalAmount:N2}").Bold(); });
                            });
                        });
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                    });
            });
        })
        .GeneratePdf();
    }

    public byte[] GeneratePurchaseOrderPdf(PurchaseOrder po)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text($"Purchase Order #{po.OrderNumber}").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                            column.Item().Text($"Date: {po.OrderDate:dd MMM yyyy}");
                            if (po.ExpectedDeliveryDate.HasValue)
                                column.Item().Text($"Expected Delivery: {po.ExpectedDeliveryDate:dd MMM yyyy}");
                        });

                        row.ConstantItem(100).Height(50).Placeholder(); // Logo Placeholder
                    });

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        // Vendor Details
                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Column(vendorCol =>
                            {
                                vendorCol.Item().Text("To Vendor:").Bold();
                                vendorCol.Item().Text(po.Vendor?.Name ?? "Vendor");
                                if (po.Vendor != null)
                                {
                                    if (!string.IsNullOrEmpty(po.Vendor.BillingAddress))
                                        vendorCol.Item().Text(po.Vendor.BillingAddress);
                                    if (!string.IsNullOrEmpty(po.Vendor.BillingCity))
                                        vendorCol.Item().Text($"{po.Vendor.BillingCity}, {po.Vendor.BillingState}");
                                }
                            });
                        });
                        
                        column.Item().PaddingVertical(5);

                        // Table
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(25);
                                columns.RelativeColumn(3);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("#");
                                header.Cell().Element(CellStyle).Text("Item");
                                header.Cell().Element(CellStyle).AlignRight().Text("Rate");
                                header.Cell().Element(CellStyle).AlignRight().Text("Qty");
                                header.Cell().Element(CellStyle).AlignRight().Text("Total");

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                                }
                            });

                            int index = 1;
                            foreach (var item in po.Items)
                            {
                                table.Cell().Element(CellStyle).Text($"{index++}");
                                table.Cell().Element(CellStyle).Text(item.Description ?? "Item");
                                table.Cell().Element(CellStyle).AlignRight().Text($"{item.UnitPrice:N2}");
                                table.Cell().Element(CellStyle).AlignRight().Text($"{item.Quantity}");
                                table.Cell().Element(CellStyle).AlignRight().Text($"{item.TotalAmount:N2}");

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten3).PaddingVertical(5);
                                }
                            }
                        });
                        
                        column.Item().PaddingVertical(10);

                        // Totals
                        column.Item().Row(row =>
                        {
                            row.RelativeItem(); // Spacer
                            row.ConstantItem(250).Column(col =>
                            {
                                col.Item().Row(r => { r.RelativeItem().Text("Sub Total:"); r.RelativeItem().AlignRight().Text($"{po.SubTotal:N2}"); });
                                if (po.TaxAmount > 0)
                                    col.Item().Row(r => { r.RelativeItem().Text("Tax Total:"); r.RelativeItem().AlignRight().Text($"{po.TaxAmount:N2}"); });
                                if (po.DiscountAmount > 0)
                                    col.Item().Row(r => { r.RelativeItem().Text("Discount:"); r.RelativeItem().AlignRight().Text($"-{po.DiscountAmount:N2}"); });
                                if (po.Adjustment != 0)
                                    col.Item().Row(r => { r.RelativeItem().Text("Adjustment:"); r.RelativeItem().AlignRight().Text($"{po.Adjustment:N2}"); });
                                    
                                col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                                
                                col.Item().Row(r => { r.RelativeItem().Text("Grand Total:").Bold().FontSize(12); r.RelativeItem().AlignRight().Text($"{po.TotalAmount:N2}").Bold().FontSize(12); });
                            });
                        });
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                    });
            });
        })
        .GeneratePdf();
    }
}
