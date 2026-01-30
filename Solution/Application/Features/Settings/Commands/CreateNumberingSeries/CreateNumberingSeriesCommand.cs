using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;

namespace CompreoBooks.Application.Features.Settings.Commands.CreateNumberingSeries;

public record CreateNumberingSeriesCommand : IRequest<int>
{
    public string EntityName { get; init; } = string.Empty;
    public string Prefix { get; init; } = string.Empty;
    public int StartingNumber { get; init; }
    public string Suffix { get; init; } = string.Empty;
    public int PaddingLength { get; init; } = 4;
    public int ResetFrequency { get; init; } // 0=Never, 1=Yearly, 2=Monthly
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }
}

public class CreateNumberingSeriesCommandValidator : AbstractValidator<CreateNumberingSeriesCommand>
{
    public CreateNumberingSeriesCommandValidator()
    {
        RuleFor(v => v.EntityName)
            .NotEmpty().WithMessage("Entity Name is required.")
            .MaximumLength(50).WithMessage("Entity Name must not exceed 50 characters.");

        RuleFor(v => v.Prefix)
            .MaximumLength(20).WithMessage("Prefix must not exceed 20 characters.");

        RuleFor(v => v.Suffix)
            .MaximumLength(20).WithMessage("Suffix must not exceed 20 characters.");

        RuleFor(v => v.StartingNumber)
            .GreaterThanOrEqualTo(0).WithMessage("Starting Number must be non-negative.");
    }
}

public class CreateNumberingSeriesCommandHandler : IRequestHandler<CreateNumberingSeriesCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateNumberingSeriesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateNumberingSeriesCommand request, CancellationToken cancellationToken)
    {
        var entity = new NumberingSeries
        {
            EntityName = request.EntityName,
            Prefix = request.Prefix,
            StartingNumber = request.StartingNumber,
            LastUsedNumber = request.StartingNumber - 1, // Initialize so next number is StartingNumber
            Suffix = request.Suffix,
            PaddingLength = request.PaddingLength,
            ResetFrequency = (ResetFrequency)request.ResetFrequency,
            IsDefault = request.IsDefault,
            IsActive = request.IsActive
        };

        if (request.IsDefault)
        {
            // Unset other defaults for this entity
            // Note: This logic might need to be more robust (e.g. handle concurrency), but keeping it simple for now.
            var existingDefaults = _context.NumberingSeries
                .Where(ns => ns.EntityName == request.EntityName && ns.IsDefault);
            
            foreach (var existing in existingDefaults)
            {
                existing.IsDefault = false;
            }
        }

        _context.NumberingSeries.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
