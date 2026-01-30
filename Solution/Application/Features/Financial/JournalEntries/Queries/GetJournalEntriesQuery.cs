using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Financial.JournalEntries.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.JournalEntries.Queries;

public record GetJournalEntriesQuery : IRequest<List<JournalEntryDto>>;

public class GetJournalEntriesQueryHandler : IRequestHandler<GetJournalEntriesQuery, List<JournalEntryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetJournalEntriesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<JournalEntryDto>> Handle(GetJournalEntriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.JournalEntries
            .Include(x => x.Lines)
            .ThenInclude(l => l.Account)
            .OrderByDescending(x => x.JournalDate)
            .ProjectTo<JournalEntryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
