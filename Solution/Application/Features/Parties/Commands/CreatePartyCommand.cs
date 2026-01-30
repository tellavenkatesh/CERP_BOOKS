using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Parties.DTOs;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Parties.Commands;

public record CreatePartyCommand(CreatePartyDto Party) : IRequest<Guid>;

public class CreatePartyValidator : AbstractValidator<CreatePartyCommand>
{
    public CreatePartyValidator()
    {
        RuleFor(x => x.Party.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Party.DisplayName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Party.Email).EmailAddress().MaximumLength(200).When(x => !string.IsNullOrEmpty(x.Party.Email));
        RuleFor(x => x.Party.Phone).MaximumLength(20);
        RuleFor(x => x.Party.Mobile).MaximumLength(20);
        RuleFor(x => x.Party.Website).MaximumLength(200);
        RuleFor(x => x.Party.PanNumber).MaximumLength(10).Matches("^[A-Z]{5}[0-9]{4}[A-Z]{1}$").When(x => !string.IsNullOrEmpty(x.Party.PanNumber));
        RuleFor(x => x.Party.GstIn).MaximumLength(15).When(x => !string.IsNullOrEmpty(x.Party.GstIn));
        
        RuleFor(x => x.Party.BillingState).NotEmpty().When(x => !string.IsNullOrEmpty(x.Party.BillingAddress));
        RuleFor(x => x.Party.BillingPincode).MaximumLength(10);
        RuleFor(x => x.Party.ShippingPincode).MaximumLength(10);
    }
}

public class CreatePartyHandler : IRequestHandler<CreatePartyCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreatePartyHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreatePartyCommand request, CancellationToken cancellationToken)
    {
        var party = _mapper.Map<Party>(request.Party);
        _context.Parties.Add(party);
        await _context.SaveChangesAsync(cancellationToken);
        return party.Id;
    }
}
