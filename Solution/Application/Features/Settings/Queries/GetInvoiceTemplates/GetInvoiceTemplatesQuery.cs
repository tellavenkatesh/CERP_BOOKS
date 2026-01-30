using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Settings.Queries.GetInvoiceTemplates;

public record GetInvoiceTemplatesQuery : IRequest<List<InvoiceTemplateDto>>;

public class GetInvoiceTemplatesQueryHandler : IRequestHandler<GetInvoiceTemplatesQuery, List<InvoiceTemplateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetInvoiceTemplatesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<InvoiceTemplateDto>> Handle(GetInvoiceTemplatesQuery request, CancellationToken cancellationToken)
    {
        return await _context.InvoiceTemplates
            .ProjectTo<InvoiceTemplateDto>(_mapper.ConfigurationProvider)
            .OrderByDescending(t => t.IsDefault)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }
}

public class InvoiceTemplateDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Layout { get; init; } = string.Empty;
    public string PrimaryColor { get; init; } = string.Empty;
    public string AccentColor { get; init; } = string.Empty;
    public string HeaderText { get; init; } = string.Empty;
    public string FooterText { get; init; } = string.Empty;
    public bool ShowBankDetails { get; init; }
    public string Logo { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CompreoBooks.Domain.Entities.Masters.InvoiceTemplate, InvoiceTemplateDto>();
        }
    }
}
