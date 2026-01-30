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

public record GetAllSalesOrdersQuery : IRequest<List<SalesOrderDto>>;

public class GetAllSalesOrdersQueryHandler : IRequestHandler<GetAllSalesOrdersQuery, List<SalesOrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllSalesOrdersQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<SalesOrderDto>> Handle(GetAllSalesOrdersQuery request, CancellationToken cancellationToken)
    {
        return await _context.SalesOrders
            .Include(so => so.Customer)
            .Include(so => so.Items)
                .ThenInclude(i => i.Item)
            .OrderByDescending(so => so.OrderDate)
            .ProjectTo<SalesOrderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
