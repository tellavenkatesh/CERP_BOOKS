using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Accounts.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Accounts.Queries;

public record GetAllAccountsQuery : IRequest<List<AccountDto>>;

public class GetAllAccountsHandler : IRequestHandler<GetAllAccountsQuery, List<AccountDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllAccountsHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AccountDto>> Handle(GetAllAccountsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Accounts
            .ProjectTo<AccountDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
