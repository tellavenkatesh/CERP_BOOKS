using System.Threading.Tasks;
using CompreoBooks.Domain.Entities.Identity;

namespace CompreoBooks.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(string? Token, User? User)> LoginAsync(string email, string password);
    Task<(bool Success, string? Error, User? User)> RegisterAsync(string email, string password, string firstName, string lastName);
    Task<bool> ResetPasswordAsync(Guid userId, string newPassword);
}
