using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetAllEstimatesQuery : IRequest<List<EstimateDto>>;

public class GetAllEstimatesQueryHandler : IRequestHandler<GetAllEstimatesQuery, List<EstimateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllEstimatesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<EstimateDto>> Handle(GetAllEstimatesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Estimates
            .Include(e => e.Customer)
            .Include(e => e.Items)
                .ThenInclude(ei => ei.Item)
            .OrderByDescending(e => e.EstimateNumber)
            .ProjectTo<EstimateDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
