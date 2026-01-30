using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Purchase.DTOs;
using CompreoBooks.Domain.Entities.Purchase;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Commands;

public record CreatePurchaseRequestCommand(CreatePurchaseRequestDto Dto) : IRequest<Guid>;

public class CreatePurchaseRequestCommandValidator : AbstractValidator<CreatePurchaseRequestCommand>
{
    public CreatePurchaseRequestCommandValidator()
    {
        RuleFor(v => v.Dto.RequestedBy).NotEmpty();
        // RuleFor(v => v.Dto.RequiredDate).NotEmpty(); // Made Optional for MVP
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreatePurchaseRequestCommandHandler : IRequestHandler<CreatePurchaseRequestCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreatePurchaseRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Generate PR Number
        var count = await _context.PurchaseRequests.CountAsync(cancellationToken);
        var prNumber = $"PR-{(count + 1):D4}";

        var entity = new PurchaseRequest
        {
            RequestNumber = prNumber,
            RequestDate = DateTime.UtcNow,
            RequiredDate = dto.RequiredDate,
            RequestedBy = dto.RequestedBy,
            Reason = dto.Reason,
            Department = dto.Department,
            Priority = (PurchaseRequestPriority)dto.Priority,
            Status = PurchaseRequestStatus.Draft
        };

        foreach (var item in dto.Items)
        {
            entity.Items.Add(new PurchaseRequestItem
            {
                ItemId = item.ItemId,
                Description = item.Description,
                Quantity = item.Quantity,
                EstimatedRate = item.EstimatedRate
            });
        }

        _context.PurchaseRequests.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
