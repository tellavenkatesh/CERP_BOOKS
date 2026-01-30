using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record ApproveSalesOrderCommand(Guid Id) : IRequest<bool>;

public class ApproveSalesOrderCommandHandler : IRequestHandler<ApproveSalesOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveSalesOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SalesOrders.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            return false; // Or throw NotFoundException
        }

        if (entity.ApprovalStatus == ApprovalStatus.Approved)
        {
            return true; // Already approved
        }

        entity.ApprovalStatus = ApprovalStatus.Approved;
        
        // If Standard Flow, changing from Draft to Confirmed might happen here or earlier.
        // Let's assume Approval moves it to Confirmed if it was Draft.
        if (entity.Status == OrderStatus.Draft)
        {
            entity.Status = OrderStatus.Confirmed;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
