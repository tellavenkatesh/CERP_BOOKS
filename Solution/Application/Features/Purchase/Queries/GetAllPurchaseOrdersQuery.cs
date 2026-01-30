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

public record GetAllPurchaseOrdersQuery : IRequest<List<PurchaseOrderDto>>;

public class GetAllPurchaseOrdersQueryHandler : IRequestHandler<GetAllPurchaseOrdersQuery, List<PurchaseOrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllPurchaseOrdersQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PurchaseOrderDto>> Handle(GetAllPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        return await _context.PurchaseOrders
            .Include(o => o.Vendor)
            .Include(o => o.Items)
                .ThenInclude(i => i.Item)
            .OrderByDescending(o => o.OrderDate)
            .ProjectTo<PurchaseOrderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
