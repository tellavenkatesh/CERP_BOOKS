using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Settings.Queries.GetNumberingSeries;

public record GetNumberingSeriesQuery : IRequest<List<NumberingSeriesDto>>;

public class NumberingSeriesDto
{
    public int Id { get; init; }
    public string EntityName { get; init; } = string.Empty;
    public string Prefix { get; init; } = string.Empty;
    public int StartingNumber { get; init; }
    public int LastUsedNumber { get; init; }
    public string Suffix { get; init; } = string.Empty;
    public int PaddingLength { get; init; }
    public int ResetFrequency { get; init; }
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }
    public string Preview => $"{Prefix}{(LastUsedNumber + 1).ToString($"D{PaddingLength}")}{Suffix}"; // Preview of next number

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<NumberingSeries, NumberingSeriesDto>();
        }
    }
}

public class GetNumberingSeriesQueryHandler : IRequestHandler<GetNumberingSeriesQuery, List<NumberingSeriesDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetNumberingSeriesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<NumberingSeriesDto>> Handle(GetNumberingSeriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.NumberingSeries
            .AsNoTracking()
            .ProjectTo<NumberingSeriesDto>(_mapper.ConfigurationProvider)
            .OrderBy(ns => ns.EntityName)
            .ThenByDescending(ns => ns.IsDefault)
            .ToListAsync(cancellationToken);
    }
}
