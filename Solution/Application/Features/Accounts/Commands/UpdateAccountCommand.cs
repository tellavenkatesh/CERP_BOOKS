using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Accounts.DTOs;
using CompreoBooks.Domain.Entities.Masters;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Accounts.Commands;

public record UpdateAccountCommand(Guid Id, CreateAccountDto Account) : IRequest<Unit>;

public class UpdateAccountHandler : IRequestHandler<UpdateAccountCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateAccountHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Accounts
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Account {request.Id} not found.");
        }

        // Map updates
        entity.Name = request.Account.Name;
        entity.Code = request.Account.Code;
        entity.Type = request.Account.Type;
        entity.ParentAccountId = request.Account.ParentAccountId;
        entity.Description = request.Account.Description;
        entity.OpeningBalance = request.Account.OpeningBalance;
        entity.IsActive = request.Account.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
