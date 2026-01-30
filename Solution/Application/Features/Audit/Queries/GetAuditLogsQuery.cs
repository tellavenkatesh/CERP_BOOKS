using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Audit.Queries;

public record GetAuditLogsQuery(string? UserId = null, string? EntityName = null, string? Action = null, System.DateTime? StartDate = null, System.DateTime? EndDate = null) : IRequest<List<AuditLogDto>>;

public record AuditLogDto(System.Guid Id, string EntityName, string Action, string UserId, string IpAddress, System.DateTime Timestamp, string OldValues, string NewValues);

public class GetAuditLogsHandler : IRequestHandler<GetAuditLogsQuery, List<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(request.UserId))
            query = query.Where(l => l.UserId.Contains(request.UserId)); // Simple search

        if (!string.IsNullOrEmpty(request.EntityName))
            query = query.Where(l => l.EntityName == request.EntityName);
            
        if (!string.IsNullOrEmpty(request.Action))
            query = query.Where(l => l.Action == request.Action);

        if (request.StartDate.HasValue)
            query = query.Where(l => l.Timestamp >= request.StartDate.Value.ToUniversalTime());

        if (request.EndDate.HasValue)
            query = query.Where(l => l.Timestamp <= request.EndDate.Value.ToUniversalTime());

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Take(100) // Default limit, could be paginated
            .ToListAsync(cancellationToken);

        return logs.Select(l => new AuditLogDto(l.Id, l.EntityName, l.Action, l.UserId, l.IpAddress, l.Timestamp, l.OldValues, l.NewValues)).ToList();
    }
}
