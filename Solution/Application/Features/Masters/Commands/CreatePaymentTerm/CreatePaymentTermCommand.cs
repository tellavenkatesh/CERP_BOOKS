using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;

namespace CompreoBooks.Application.Features.Masters.Commands.CreatePaymentTerm;

public record CreatePaymentTermCommand : IRequest<int>
{
    public string Name { get; init; } = string.Empty;
    public int Days { get; init; }
    public string Description { get; init; } = string.Empty;
    public bool IsActive { get; init; } = true;
}

public class CreatePaymentTermCommandValidator : AbstractValidator<CreatePaymentTermCommand>
{
    public CreatePaymentTermCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(v => v.Days)
            .GreaterThanOrEqualTo(0).WithMessage("Days must be greater than or equal to 0.");

        RuleFor(v => v.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}

public class CreatePaymentTermCommandHandler : IRequestHandler<CreatePaymentTermCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreatePaymentTermCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreatePaymentTermCommand request, CancellationToken cancellationToken)
    {
        var entity = new PaymentTerm
        {
            Name = request.Name,
            Days = request.Days,
            Description = request.Description,
            IsActive = request.IsActive
        };

        _context.PaymentTerms.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
