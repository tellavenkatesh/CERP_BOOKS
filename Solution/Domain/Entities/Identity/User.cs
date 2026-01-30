using System;

namespace CompreoBooks.Domain.Entities.Identity;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Simple RBAC string for MVP
    public string Phone { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new(); // Granular access control
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
