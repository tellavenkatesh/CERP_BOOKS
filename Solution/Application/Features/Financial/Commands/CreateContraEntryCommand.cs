using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Commands;

public record CreateContraEntryCommand : IRequest<Guid>
{
    public DateTime ContraDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<CreateContraEntryLineItem> Lines { get; set; } = new();
}

public class CreateContraEntryLineItem
{
    public Guid AccountId { get; set; }
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public ContraType Type { get; set; }
}

public class CreateContraEntryCommandValidator : AbstractValidator<CreateContraEntryCommand>
{
    public CreateContraEntryCommandValidator()
    {
        RuleFor(v => v.ContraDate).NotEmpty();
        RuleFor(v => v.Lines).NotEmpty().Must(x => x.Count >= 2).WithMessage("At least two lines are required.");
        
        // Validate total debits equal total credits
        RuleFor(v => v).Must(command => 
        {
            var debits = command.Lines.Where(x => x.Type == ContraType.Debit).Sum(x => x.Amount);
            var credits = command.Lines.Where(x => x.Type == ContraType.Credit).Sum(x => x.Amount);
            return debits == credits;
        }).WithMessage("Total Debits must equal Total Credits.");
    }
}

public class CreateContraEntryCommandHandler : IRequestHandler<CreateContraEntryCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateContraEntryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateContraEntryCommand request, CancellationToken cancellationToken)
    {
        // Generate Contra Number
        var count = await _context.ContraEntries.CountAsync(cancellationToken) + 1;
        var contraNumber = $"CNTRA-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";

        while (await _context.ContraEntries.AnyAsync(x => x.ContraNumber == contraNumber, cancellationToken))
        {
            count++;
            contraNumber = $"CNTRA-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";
        }

        var entity = new ContraEntry
        {
            ContraNumber = contraNumber,
            ContraDate = request.ContraDate.ToUniversalTime(),
            Description = request.Description,
            Status = ContraEntryStatus.Posted
        };

        foreach (var lineDto in request.Lines)
        {
            entity.Lines.Add(new ContraEntryLine
            {
                AccountId = lineDto.AccountId,
                Description = lineDto.Description,
                Amount = lineDto.Amount,
                Type = lineDto.Type
            });
        }
        
        entity.TotalAmount = entity.Lines.Where(x => x.Type == ContraType.Debit).Sum(x => x.Amount);

        _context.ContraEntries.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
