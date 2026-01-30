using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Companies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Companies.Commands;

public record UpdateCompanyCommand(UpdateCompanyDto Company) : IRequest<bool>;

public class UpdateCompanyHandler : IRequestHandler<UpdateCompanyCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateCompanyHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(cancellationToken);
        
        if (company == null)
        {
            company = new Domain.Entities.Masters.Company();
            _context.Companies.Add(company);
        }

        // Map updates manually since we need to handle specific logic
        company.Name = request.Company.Name;
        company.Address = request.Company.Address;
        company.City = request.Company.City;
        company.State = request.Company.State;
        company.Country = request.Company.Country;
        company.Pincode = request.Company.Pincode;
        company.Phone = request.Company.Phone;
        company.Email = request.Company.Email;
        company.Website = request.Company.Website;
        company.TaxId = request.Company.TaxId;
        company.PanNumber = request.Company.PanNumber;
        company.Currency = request.Company.Currency;
        company.Industry = request.Company.Industry;
        company.CompanyType = request.Company.CompanyType;
        company.EnableGST = request.Company.EnableGST;
        company.EnableTDS = request.Company.EnableTDS;

        // Date conversions
        company.FiscalYearStart = DateTime.SpecifyKind(request.Company.FiscalYearStart, DateTimeKind.Utc);
        company.FiscalYearEnd = DateTime.SpecifyKind(request.Company.FiscalYearEnd, DateTimeKind.Utc);
        company.BooksOpeningDate = DateTime.SpecifyKind(request.Company.BooksOpeningDate, DateTimeKind.Utc);

        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
