using System;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;

namespace CompreoBooks.Application.Features.Masters.Commands.CreateTaxCode;

public record CreateTaxCodeCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public bool IsTds { get; set; }
    public TaxType TaxType { get; set; }
    public Guid? PayableAccountId { get; set; }
    public Guid? ReceivableAccountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class CreateTaxCodeCommandValidator : AbstractValidator<CreateTaxCodeCommand>
{
    public CreateTaxCodeCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty();
        RuleFor(v => v.Code).NotEmpty();
        RuleFor(v => v.Rate).GreaterThanOrEqualTo(0);
    }
}

public class CreateTaxCodeCommandHandler : IRequestHandler<CreateTaxCodeCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateTaxCodeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTaxCodeCommand request, CancellationToken cancellationToken)
    {
        var entity = new TaxCode
        {
            Name = request.Name,
            Code = request.Code,
            Rate = request.Rate,
            IsTds = request.IsTds,
            TaxType = request.TaxType,
            PayableAccountId = request.PayableAccountId,
            ReceivableAccountId = request.ReceivableAccountId,
            Description = request.Description,
            IsActive = request.IsActive
        };

        _context.TaxCodes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
