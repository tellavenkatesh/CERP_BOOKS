using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Masters.Queries.GetPaymentTerms;

public record GetPaymentTermsQuery : IRequest<List<PaymentTermDto>>;

public class PaymentTermDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Days { get; init; }
    public string Description { get; init; } = string.Empty;
    public bool IsActive { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<PaymentTerm, PaymentTermDto>();
        }
    }
}

public class GetPaymentTermsQueryHandler : IRequestHandler<GetPaymentTermsQuery, List<PaymentTermDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPaymentTermsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PaymentTermDto>> Handle(GetPaymentTermsQuery request, CancellationToken cancellationToken)
    {
        return await _context.PaymentTerms
            .AsNoTracking()
            .ProjectTo<PaymentTermDto>(_mapper.ConfigurationProvider)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}
