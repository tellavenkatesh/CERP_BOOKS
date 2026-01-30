using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace CompreoBooks.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Ideally we read from configuration, but for design-time simplicity we can check common paths or use a default.
        // This is primarily for 'dotnet ef' commands.
        
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Database=Compreo_Books_ERP_DB;Username=postgres;Password=postgres", x => x.UseVector());

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
