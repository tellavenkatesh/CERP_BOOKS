using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Items.DTOs;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Items.Commands;

public record CreateItemCommand(CreateItemDto Item) : IRequest<Guid>;

public class CreateItemValidator : AbstractValidator<CreateItemCommand>
{
    public CreateItemValidator()
    {
        RuleFor(x => x.Item.Name).NotEmpty();
        RuleFor(x => x.Item.Code).NotEmpty();
        RuleFor(x => x.Item.SalesPrice).GreaterThanOrEqualTo(0);
    }
}

public class CreateItemHandler : IRequestHandler<CreateItemCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateItemHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateItemCommand request, CancellationToken cancellationToken)
    {
        var item = _mapper.Map<Item>(request.Item);
        
        // Manual Map Enum if AutoMapper doesn't handle int -> Enum automatically safely
        item.Type = (ItemType)request.Item.Type;

        // Set current stock = opening stock initially
        if (item.TrackInventory)
        {
            item.CurrentStock = item.OpeningQuantity;
        }
        
        _context.Items.Add(item);
        await _context.SaveChangesAsync(cancellationToken);
        return item.Id;
    }
}
