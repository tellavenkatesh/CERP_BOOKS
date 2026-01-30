using System;

namespace CompreoBooks.Domain.Entities.Masters;

public enum PartyType
{
    Customer,
    Vendor
}

public class Party
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;

    public ICollection<ContactPerson> ContactPersons { get; set; } = new List<ContactPerson>();
    
    // Billing Address
    // Billing Address
    public string BillingAttention { get; set; } = string.Empty;
    public string BillingAddress { get; set; } = string.Empty; // Street 1
    public string BillingStreet2 { get; set; } = string.Empty;
    public string BillingCity { get; set; } = string.Empty;
    public string BillingState { get; set; } = string.Empty;
    public string BillingCountry { get; set; } = string.Empty;
    public string BillingPincode { get; set; } = string.Empty;
    public string BillingPhone { get; set; } = string.Empty;
    public string BillingFax { get; set; } = string.Empty;

    // Shipping Address
    // Shipping Address
    public string ShippingAttention { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty; // Street 1
    public string ShippingStreet2 { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingState { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public string ShippingPincode { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string ShippingFax { get; set; } = string.Empty;
    
    // Tax Info
    public string GstIn { get; set; } = string.Empty; 
    public string PanNumber { get; set; } = string.Empty;
    
    // Config
    public Guid? TdsCategoryId { get; set; }
    public int? PaymentTermId { get; set; } 

    // Financials
    public decimal CreditLimit { get; set; }
    public decimal OpeningBalance { get; set; } // Positive = Receivable, Negative = Payable
    
    // Bank Details (For Vendors)
    public string BankName { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankIfscCode { get; set; } = string.Empty;
    
    public string Notes { get; set; } = string.Empty;

    public int Type { get; set; } // 0 = Customer, 1 = Vendor
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    // New Fields for Redesign
    public string Salutation { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty; // If individual, this might be empty or same as Name
    public string Website { get; set; } = string.Empty;
    
    // Social / Other Contact
    public string SkypeName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Twitter { get; set; } = string.Empty;
    public string Facebook { get; set; } = string.Empty;

    // Config / Preferences
    public string PlaceOfSupply { get; set; } = string.Empty;
    public string TaxPreference { get; set; } = "Taxable"; // Taxable, TaxExempt
    public string Currency { get; set; } = "INR";
    
    public bool PortalEnabled { get; set; }
    public string PortalLanguage { get; set; } = "English";

    // Newly added fields
    public string GstTreatment { get; set; } = string.Empty;
    public string AadhaarNumber { get; set; } = string.Empty;
    public Guid? PriceListId { get; set; }
}
