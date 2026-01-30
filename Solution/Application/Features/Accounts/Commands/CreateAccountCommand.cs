using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Accounts.DTOs;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Accounts.Commands;

public record CreateAccountCommand(CreateAccountDto Account) : IRequest<Guid>;

public class CreateAccountValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountValidator()
    {
        RuleFor(x => x.Account.Name).NotEmpty();
        RuleFor(x => x.Account.Code).NotEmpty();
    }
}

public class CreateAccountHandler : IRequestHandler<CreateAccountCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateAccountHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = _mapper.Map<Account>(request.Account);
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);
        return account.Id;
    }
}
