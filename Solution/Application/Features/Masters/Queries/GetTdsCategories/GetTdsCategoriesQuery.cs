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

namespace CompreoBooks.Application.Features.Masters.Queries.GetTdsCategories;

public record GetTdsCategoriesQuery : IRequest<List<TdsCategoryDto>>;

public class TdsCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public decimal ThresholdAmount { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class TdsCategoryProfile : Profile
{
    public TdsCategoryProfile()
    {
        CreateMap<TdsCategory, TdsCategoryDto>();
    }
}

public class GetTdsCategoriesQueryHandler : IRequestHandler<GetTdsCategoriesQuery, List<TdsCategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTdsCategoriesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TdsCategoryDto>> Handle(GetTdsCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.TdsCategories
            .OrderBy(x => x.Code)
            .ProjectTo<TdsCategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
