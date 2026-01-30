using CompreoBooks.Domain.Entities.Masters;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;

namespace CompreoBooks.Application.Features.Parties.Queries;

public record GetPartyByIdQuery(Guid Id) : IRequest<Party?>;

public class GetPartyByIdQueryHandler : IRequestHandler<GetPartyByIdQuery, Party?>
{
    private readonly IApplicationDbContext _context;

    public GetPartyByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Party?> Handle(GetPartyByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Parties
            .Include(p => p.ContactPersons)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
    }
}
