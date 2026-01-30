using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Parties.DTOs;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Parties.Commands;

public record UpdatePartyCommand(Guid Id, CreatePartyDto Party) : IRequest<Unit>;

public class UpdatePartyValidator : AbstractValidator<UpdatePartyCommand>
{
    public UpdatePartyValidator()
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

public class UpdatePartyHandler : IRequestHandler<UpdatePartyCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdatePartyHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdatePartyCommand request, CancellationToken cancellationToken)
    {
        var party = await _context.Parties
            .Include(p => p.ContactPersons)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
            
        if (party == null)
        {
            throw new Exception($"Party {request.Id} not found.");
        }

        // Map updates
        _mapper.Map(request.Party, party);
        
        // Handle specifically nested collections if AutoMapper doesn't do it automatically or cleanly for EF Core
        // For now relying on AutoMapper collection mapping if configured, otherwise might need manual handling.
        // Given Clean Architecture template usually handles this via AutoMapper profiles.
        
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
