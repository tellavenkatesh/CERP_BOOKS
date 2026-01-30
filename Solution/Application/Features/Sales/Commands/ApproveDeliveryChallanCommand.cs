using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record ApproveDeliveryChallanCommand(Guid Id) : IRequest<bool>;

public class ApproveDeliveryChallanCommandHandler : IRequestHandler<ApproveDeliveryChallanCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveDeliveryChallanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveDeliveryChallanCommand request, CancellationToken cancellationToken)
    {
        // Include Lines to access ItemId and Quantity
        var entity = await _context.DeliveryChallans
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return false;

        // Idempotency check: Don't deduct stock again if already approved/dispatched
        if (entity.ApprovalStatus == ApprovalStatus.Approved) return true;

        entity.ApprovalStatus = ApprovalStatus.Approved;
        
        if (entity.Status == DeliveryChallanStatus.Draft)
        {
            entity.Status = DeliveryChallanStatus.Dispatched;
        }

        // Deduct Inventory
        foreach (var line in entity.Lines)
        {
            var item = await _context.Items.FindAsync(new object[] { line.ItemId }, cancellationToken);
            if (item != null && item.TrackInventory)
            {
                item.CurrentStock -= line.DeliveredQuantity;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
