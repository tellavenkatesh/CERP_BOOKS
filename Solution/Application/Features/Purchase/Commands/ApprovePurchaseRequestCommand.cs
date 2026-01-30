using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;

namespace CompreoBooks.Application.Features.Purchase.Commands;

public record ApprovePurchaseRequestCommand(Guid Id, string Remarks) : IRequest<bool>;

public class ApprovePurchaseRequestCommandHandler : IRequestHandler<ApprovePurchaseRequestCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApprovePurchaseRequestCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ApprovePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PurchaseRequests.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null) return false;

        entity.Status = PurchaseRequestStatus.Approved;
        entity.Remarks = request.Remarks;
        entity.ApprovedBy = _currentUserService.UserName ?? "Admin"; // Fallback to Admin if name missing
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
