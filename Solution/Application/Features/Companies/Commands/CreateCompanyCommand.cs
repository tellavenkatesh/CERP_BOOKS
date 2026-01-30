using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Companies.DTOs;
using CompreoBooks.Domain.Entities.Masters;
using FluentValidation;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Companies.Commands;

public record CreateCompanyCommand(CreateCompanyDto Company) : IRequest<Guid>;

public class CreateCompanyValidator : AbstractValidator<CreateCompanyCommand>
{
    public CreateCompanyValidator()
    {
        RuleFor(x => x.Company.Name).NotEmpty().MaximumLength(200);
        // RuleFor(x => x.Company.TaxId).NotEmpty(); // Made optional to match frontend
    }
}

public class CreateCompanyHandler : IRequestHandler<CreateCompanyCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateCompanyHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = _mapper.Map<Company>(request.Company);
        
        // Ensure DateTimes are UTC for Npgsql
        company.FiscalYearStart = DateTime.SpecifyKind(company.FiscalYearStart, DateTimeKind.Utc);
        company.FiscalYearEnd = DateTime.SpecifyKind(company.FiscalYearEnd, DateTimeKind.Utc);
        company.BooksOpeningDate = DateTime.SpecifyKind(company.BooksOpeningDate, DateTimeKind.Utc);
        
        _context.Companies.Add(company);
        await _context.SaveChangesAsync(cancellationToken);
        return company.Id;
    }
}
