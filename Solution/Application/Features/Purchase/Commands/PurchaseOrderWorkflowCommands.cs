using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Commands;

public record ApprovePurchaseOrderCommand(Guid Id) : IRequest<bool>;

public class ApprovePurchaseOrderCommandHandler : IRequestHandler<ApprovePurchaseOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApprovePurchaseOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApprovePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var po = await _context.PurchaseOrders.FindAsync(new object[] { request.Id }, cancellationToken);
        if (po == null) return false;

        po.ApprovalStatus = ApprovalStatus.Approved;
        // Optionally move status if needed, but usually PO stays 'Draft' until Sent, or moves to 'Approved' state if that exists.
        // Let's assume Draft -> Sent. Approval is an internal flag.
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record SendPurchaseOrderCommand(Guid Id) : IRequest<bool>;

public class SendPurchaseOrderCommandHandler : IRequestHandler<SendPurchaseOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;

    public SendPurchaseOrderCommandHandler(IApplicationDbContext context, IEmailService emailService, IPdfService pdfService)
    {
        _context = context;
        _emailService = emailService;
        _pdfService = pdfService;
    }

    public async Task<bool> Handle(SendPurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var po = await _context.PurchaseOrders
            .Include(x => x.Vendor)
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (po == null) return false;

        if (po.ApprovalStatus != ApprovalStatus.Approved)
        {
             // Auto-approve when sending
             po.ApprovalStatus = ApprovalStatus.Approved;
        }

        // Generate PDF
        var pdfBytes = _pdfService.GeneratePurchaseOrderPdf(po);

        // Send Email
        if (po.Vendor != null && !string.IsNullOrEmpty(po.Vendor.Email))
        {
            var subject = $"Purchase Order #{po.OrderNumber} from Compreo Books";
            var body = $"Dear {po.Vendor.Name},\n\nPlease find attached Purchase Order #{po.OrderNumber}.\n\nRegards,\nCompreo Books Team";
            var fileName = $"PurchaseOrder_{po.OrderNumber}.pdf";

            await _emailService.SendEmailWithAttachmentAsync(po.Vendor.Email, subject, body, pdfBytes, fileName);
        }

        po.Status = PurchaseOrderStatus.Sent;
        // po.SentAt = DateTime.UtcNow; 
        // Actually I didn't check if SentAt exists in PO entity. I'll stick to just Status for now to be safe, or just Status.
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
