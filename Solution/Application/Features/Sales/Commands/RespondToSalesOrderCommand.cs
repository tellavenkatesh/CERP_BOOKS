using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public class RespondToSalesOrderCommand : IRequest<bool>
{
    public Guid Token { get; set; }
    public int Action { get; set; } // 0 = Accept, 1 = Decline
    public string? Reason { get; set; }
}

public class RespondToSalesOrderCommandHandler : IRequestHandler<RespondToSalesOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RespondToSalesOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RespondToSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var so = await _context.SalesOrders
            .FirstOrDefaultAsync(e => e.PublicViewToken == request.Token, cancellationToken);

        if (so == null) throw new Exception("Invalid Token");

        if (request.Action == 0) // Accept
        {
            so.ApprovalStatus = ApprovalStatus.Approved;
            if (so.Status == OrderStatus.Draft)
            {
                so.Status = OrderStatus.Confirmed; // Confirm the order upon customer approval
            }
        }
        else // Decline
        {
            so.ApprovalStatus = ApprovalStatus.Rejected;
            // Optionally set status to Cancelled or keep as Draft?
            // Usually remains Draft or maybe a specific "Needs Revision" status.
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
