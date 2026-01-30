using System;

namespace CompreoBooks.Application.Features.Companies.DTOs;

public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string Country { get; set; }
    public string Pincode { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string Website { get; set; }
    public string TaxId { get; set; }
    public string PanNumber { get; set; }
    public string Currency { get; set; }
    public DateTime FiscalYearStart { get; set; }
    public DateTime FiscalYearEnd { get; set; }
    public DateTime BooksOpeningDate { get; set; }
    public byte[]? Logo { get; set; }
    public string Industry { get; set; }
    public string CompanyType { get; set; }
    public bool EnableGST { get; set; }
    public bool EnableTDS { get; set; }
    public DateTime? PeriodLockDate { get; set; }
    public string PeriodLockReason { get; set; } = string.Empty;
}

public class CreateCompanyDto
{
    public string Name { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string Country { get; set; }
    public string Pincode { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string Website { get; set; }
    public string TaxId { get; set; }
    public string PanNumber { get; set; }
    public string Currency { get; set; } = "INR";
    public DateTime FiscalYearStart { get; set; }
    public DateTime FiscalYearEnd { get; set; }
    public DateTime BooksOpeningDate { get; set; }
    public byte[]? Logo { get; set; }
    public string Industry { get; set; }
    public string CompanyType { get; set; }
    public bool EnableGST { get; set; }
    public bool EnableTDS { get; set; }
}
