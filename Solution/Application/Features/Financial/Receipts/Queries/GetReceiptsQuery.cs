using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Financial.Receipts.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Receipts.Queries;

public record GetReceiptsQuery : IRequest<List<ReceiptDto>>;

public class GetReceiptsQueryHandler : IRequestHandler<GetReceiptsQuery, List<ReceiptDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetReceiptsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ReceiptDto>> Handle(GetReceiptsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Receipts
            .Include(x => x.Customer)
            .OrderByDescending(x => x.ReceiptDate)
            .ProjectTo<ReceiptDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
