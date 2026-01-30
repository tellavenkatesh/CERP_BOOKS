using CompreoBooks.Domain.Entities.Masters;
using System;

namespace CompreoBooks.Application.Features.Parties.DTOs;

public class PartyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public PartyType Type { get; set; }
    public string ContactPerson { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Mobile { get; set; }
    public string GstIn { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal CreditLimit { get; set; }
    public string Currency { get; set; }
    public string CompanyName { get; set; }

    // Address Fields
    public string BillingAttention { get; set; }
    public string BillingAddress { get; set; }
    public string BillingStreet2 { get; set; }
    public string BillingCity { get; set; }
    public string BillingState { get; set; }
    public string BillingCountry { get; set; }
    public string BillingPincode { get; set; }
    public string BillingPhone { get; set; }
    public string BillingFax { get; set; }

    public string ShippingAttention { get; set; }
    public string ShippingAddress { get; set; }
    public string ShippingStreet2 { get; set; }
    public string ShippingCity { get; set; }
    public string ShippingState { get; set; }
    public string ShippingCountry { get; set; }
    public string ShippingPincode { get; set; }
    public string ShippingPhone { get; set; }
    public string ShippingFax { get; set; }

    public string PlaceOfSupply { get; set; }
    public string AadhaarNumber { get; set; }
    public string PanNumber { get; set; }
    public string Notes { get; set; }
    public string Website { get; set; }

    public List<ContactPersonDto> ContactPersons { get; set; } = new();
}

public class ContactPersonDto
{
    public Guid? Id { get; set; }
    public string Salutation { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string WorkPhone { get; set; }
    public string Mobile { get; set; }
}

public class CreatePartyDto
{
    public string Name { get; set; }
    public string? DisplayName { get; set; }
    public PartyType Type { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? BillingAttention { get; set; }
    public string? BillingAddress { get; set; } // Street 1
    public string? BillingStreet2 { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingState { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPincode { get; set; }
    public string? BillingPhone { get; set; }
    public string? BillingFax { get; set; }

    public string? ShippingAttention { get; set; }
    public string? ShippingAddress { get; set; } // Street 1
    public string? ShippingStreet2 { get; set; }
    public string? ShippingCity { get; set; }
    public string? ShippingState { get; set; }
    public string? ShippingCountry { get; set; }
    public string? ShippingPincode { get; set; }
    public string? ShippingPhone { get; set; }
    public string? ShippingFax { get; set; }
    public string? GstIn { get; set; }
    public string? PanNumber { get; set; }
    public int? PaymentTermId { get; set; }
    public Guid? TdsCategoryId { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal OpeningBalance { get; set; }
    public string? Notes { get; set; }

    // Bank Details
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankIfscCode { get; set; }

    // New Fields for Redesign
    public string? Salutation { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? CompanyName { get; set; }
    public string? Website { get; set; }
    public string? SkypeName { get; set; }
    public string? Designation { get; set; }
    public string? Department { get; set; }
    public string? Twitter { get; set; }
    public string? Facebook { get; set; }
    public string? PlaceOfSupply { get; set; }
    public string? TaxPreference { get; set; }
    public string? Currency { get; set; }
    public bool PortalEnabled { get; set; }
    public string? PortalLanguage { get; set; }
    public string? GstTreatment { get; set; }
    public string? AadhaarNumber { get; set; }
    public Guid? PriceListId { get; set; }
    public List<ContactPersonDto> ContactPersons { get; set; } = new();
}
