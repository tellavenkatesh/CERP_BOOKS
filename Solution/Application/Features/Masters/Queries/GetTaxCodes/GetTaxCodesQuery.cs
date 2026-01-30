using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Masters.Queries.GetTaxCodes;

public record GetTaxCodesQuery : IRequest<List<TaxCodeDto>>;

public class TaxCodeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public bool IsTds { get; set; }
    public TaxType TaxType { get; set; }
    public Guid? PayableAccountId { get; set; }
    public Guid? ReceivableAccountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class TaxCodeProfile : Profile
{
    public TaxCodeProfile()
    {
        CreateMap<TaxCode, TaxCodeDto>();
    }
}

public class GetTaxCodesQueryHandler : IRequestHandler<GetTaxCodesQuery, List<TaxCodeDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTaxCodesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TaxCodeDto>> Handle(GetTaxCodesQuery request, CancellationToken cancellationToken)
    {
        return await _context.TaxCodes
            .OrderBy(x => x.Name)
            .ProjectTo<TaxCodeDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
