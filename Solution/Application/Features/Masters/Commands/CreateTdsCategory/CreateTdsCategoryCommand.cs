using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;

namespace CompreoBooks.Application.Features.Masters.Commands.CreateTdsCategory;

public record CreateTdsCategoryCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public decimal ThresholdAmount { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class CreateTdsCategoryCommandValidator : AbstractValidator<CreateTdsCategoryCommand>
{
    public CreateTdsCategoryCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty();
        RuleFor(v => v.Code).NotEmpty();
        RuleFor(v => v.Rate).GreaterThanOrEqualTo(0);
        RuleFor(v => v.ThresholdAmount).GreaterThanOrEqualTo(0);
    }
}

public class CreateTdsCategoryCommandHandler : IRequestHandler<CreateTdsCategoryCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateTdsCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTdsCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new TdsCategory
        {
            Name = request.Name,
            Code = request.Code,
            Rate = request.Rate,
            ThresholdAmount = request.ThresholdAmount,
            Description = request.Description,
            IsActive = request.IsActive
        };

        _context.TdsCategories.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
