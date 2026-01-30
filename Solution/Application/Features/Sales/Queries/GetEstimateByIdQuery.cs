using System;
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

public record GetEstimateByIdQuery(Guid Id) : IRequest<EstimateDto>;

public class GetEstimateByIdQueryHandler : IRequestHandler<GetEstimateByIdQuery, EstimateDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetEstimateByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<EstimateDto> Handle(GetEstimateByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Estimates
            .Include(e => e.Customer)
            .Include(e => e.Items)
                .ThenInclude(i => i.Item)
            .Where(e => e.Id == request.Id)
            .ProjectTo<EstimateDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
