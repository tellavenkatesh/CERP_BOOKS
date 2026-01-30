using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Masters;

public class ContactPerson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Salutation { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkPhone { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;

    public Guid PartyId { get; set; }
    [ForeignKey("PartyId")]
    public Party? Party { get; set; }
}
