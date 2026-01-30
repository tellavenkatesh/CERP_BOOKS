using System;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Application.Features.Accounts.DTOs;

public class AccountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public AccountType Type { get; set; }
    public string? ParentAccountId { get; set; }
    public string? Description { get; set; }
    public decimal OpeningBalance { get; set; }
    public bool IsActive { get; set; }
}

public class CreateAccountDto
{
    public string Name { get; set; }
    public string Code { get; set; }
    public AccountType Type { get; set; }
    public string? ParentAccountId { get; set; }
    public string? Description { get; set; }
    public decimal OpeningBalance { get; set; }
    public bool IsActive { get; set; } = true;
}
