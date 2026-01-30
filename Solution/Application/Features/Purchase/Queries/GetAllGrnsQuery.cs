using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Purchase.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Queries;

public record GetAllGrnsQuery : IRequest<List<GrnDto>>;

public class GetAllGrnsQueryHandler : IRequestHandler<GetAllGrnsQuery, List<GrnDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllGrnsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<GrnDto>> Handle(GetAllGrnsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Grns
            .Include(g => g.Vendor)
            .Include(g => g.PurchaseOrder)
            .Include(g => g.Items)
                .ThenInclude(i => i.Item)
            .OrderByDescending(g => g.GrnDate)
            .ProjectTo<GrnDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
