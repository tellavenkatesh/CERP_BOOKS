using System;
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

public record GetJournalEntryByIdQuery(Guid Id) : IRequest<JournalEntryDto>;

public class GetJournalEntryByIdQueryHandler : IRequestHandler<GetJournalEntryByIdQuery, JournalEntryDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetJournalEntryByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<JournalEntryDto> Handle(GetJournalEntryByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.JournalEntries
            .Where(x => x.Id == request.Id)
            .ProjectTo<JournalEntryDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
