using CompreoBooks.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Infrastructure.Services;

namespace CompreoBooks.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        services.AddScoped<Persistence.Interceptors.AuditInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<Persistence.Interceptors.AuditInterceptor>();
            options.UseNpgsql(connectionString, o => 
            {
                o.UseVector();
                o.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            })
            .AddInterceptors(interceptor);
        });

        services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
        
        // AI Services
        services.AddHttpClient<Services.GroqAiService>();
        services.AddScoped<CompreoBooks.Application.Common.Interfaces.IAiService, Services.GroqAiService>();
        services.AddTransient<IPdfService, QuestPdfService>();
        
        services.AddScoped<IIdentityService, Identity.IdentityService>();
        services.AddScoped<IEmailService, Services.SmtpEmailService>();

        // Add Authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? ""))
            };
        });

        return services;
    }
}
