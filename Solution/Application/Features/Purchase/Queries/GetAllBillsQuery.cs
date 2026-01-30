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

public record GetAllBillsQuery : IRequest<List<BillDto>>;

public class GetAllBillsQueryHandler : IRequestHandler<GetAllBillsQuery, List<BillDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllBillsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<BillDto>> Handle(GetAllBillsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Bills
            .Include(b => b.Vendor)
            .Include(b => b.PurchaseOrder)
            .Include(b => b.Grn)
            .Include(b => b.Items)
                .ThenInclude(i => i.Item)
            .OrderByDescending(b => b.BillDate)
            .ProjectTo<BillDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
