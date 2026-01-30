using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Companies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Companies.Queries;

public record GetAllCompaniesQuery : IRequest<List<CompanyDto>>;

public class GetAllCompaniesHandler : IRequestHandler<GetAllCompaniesQuery, List<CompanyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllCompaniesHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CompanyDto>> Handle(GetAllCompaniesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Companies
            .ProjectTo<CompanyDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
