using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Companies.Commands;

public record UpdatePeriodLockCommand(DateTime? LockDate, string Reason) : IRequest<bool>;

public class UpdatePeriodLockHandler : IRequestHandler<UpdatePeriodLockCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdatePeriodLockHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdatePeriodLockCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(cancellationToken);
        if (company == null) return false;

        // Ensure LockDate is UTC if provided
        if (request.LockDate.HasValue)
        {
             company.PeriodLockDate = DateTime.SpecifyKind(request.LockDate.Value, DateTimeKind.Utc);
        }
        else
        {
             company.PeriodLockDate = null;
        }
        
        company.PeriodLockReason = request.Reason ?? string.Empty;
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
