using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Accounts.Commands;

public record DeleteAccountCommand(Guid Id) : IRequest<Unit>;

public class DeleteAccountHandler : IRequestHandler<DeleteAccountCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteAccountHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Accounts
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            // Or throw NotFoundException
            return Unit.Value;
        }

        _context.Accounts.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
