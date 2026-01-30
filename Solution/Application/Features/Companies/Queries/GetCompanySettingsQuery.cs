using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Companies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Companies.Queries;

public record GetCompanySettingsQuery : IRequest<CompanyDto>;

public class GetCompanySettingsHandler : IRequestHandler<GetCompanySettingsQuery, CompanyDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCompanySettingsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<CompanyDto> Handle(GetCompanySettingsQuery request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(cancellationToken);
        if (company == null) return null;
        return _mapper.Map<CompanyDto>(company);
    }
}
