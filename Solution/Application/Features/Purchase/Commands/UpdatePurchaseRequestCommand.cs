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

public record UpdatePurchaseRequestCommand(Guid Id, CreatePurchaseRequestDto Dto) : IRequest<string>;

public class UpdatePurchaseRequestCommandValidator : AbstractValidator<UpdatePurchaseRequestCommand>
{
    public UpdatePurchaseRequestCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Dto.RequestedBy).NotEmpty();
        RuleFor(v => v.Dto.RequiredDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class UpdatePurchaseRequestCommandHandler : IRequestHandler<UpdatePurchaseRequestCommand, string>
{
    private readonly IApplicationDbContext _context;

    public UpdatePurchaseRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(UpdatePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PurchaseRequests
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Purchase Request with ID {request.Id} not found.");
        }

        if (entity.Status != PurchaseRequestStatus.Draft)
        {
            throw new Exception("Only Draft Purchase Requests can be updated.");
        }

        var dto = request.Dto;

        entity.RequiredDate = dto.RequiredDate;
        entity.RequestedBy = dto.RequestedBy;
        entity.Reason = dto.Reason;
        entity.Department = dto.Department;
        entity.Priority = (PurchaseRequestPriority)dto.Priority;

        // Clear existing items and add new ones (Simple replacement strategy)
        _context.PurchaseRequestItems.RemoveRange(entity.Items);
        entity.Items.Clear();

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

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id.ToString();
    }
}
