using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Sales.Queries
{
    public class GetEstimateVersionsQuery : IRequest<List<EstimateVersionDto>>
    {
        public Guid EstimateId { get; set; }

        public GetEstimateVersionsQuery(Guid estimateId)
        {
            EstimateId = estimateId;
        }
    }

    public class GetEstimateVersionsQueryHandler : IRequestHandler<GetEstimateVersionsQuery, List<EstimateVersionDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetEstimateVersionsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<EstimateVersionDto>> Handle(GetEstimateVersionsQuery request, CancellationToken cancellationToken)
        {
            var versions = await _context.EstimateVersions
                .Where(v => v.EstimateId == request.EstimateId)
                .OrderByDescending(v => v.VersionNumber)
                .Select(v => new EstimateVersionDto
                {
                    Id = v.Id,
                    EstimateId = v.EstimateId,
                    VersionNumber = v.VersionNumber,
                    SnapshotJson = v.SnapshotJson,
                    CreatedAt = v.CreatedAt,
                    CreatedBy = v.CreatedBy
                })
                .ToListAsync(cancellationToken);

            return versions;
        }
    }
}
