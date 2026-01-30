using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record ApproveEstimateCommand(Guid Id) : IRequest<bool>;

public class ApproveEstimateCommandHandler : IRequestHandler<ApproveEstimateCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ApproveEstimateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ApproveEstimateCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Estimates.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null) return false;

        entity.ApprovalStatus = ApprovalStatus.Approved;
        
        // Estimate status might change to Sent or Accepted depending on workflow
        // Usually Approval means "Ready/Sent" internally
        if (entity.Status == EstimateStatus.Draft)
        {
            entity.Status = EstimateStatus.Sent; 
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
