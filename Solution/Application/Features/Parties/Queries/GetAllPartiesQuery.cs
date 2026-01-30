using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Parties.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Parties.Queries;

public record GetAllPartiesQuery : IRequest<List<PartyDto>>;

public class GetAllPartiesHandler : IRequestHandler<GetAllPartiesQuery, List<PartyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllPartiesHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PartyDto>> Handle(GetAllPartiesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Parties
            .ProjectTo<PartyDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
