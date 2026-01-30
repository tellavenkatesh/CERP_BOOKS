using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.Commands;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CompreoBooks.WebAPI.Services;

public class RecurringInvoiceBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RecurringInvoiceBackgroundService> _logger;

    public RecurringInvoiceBackgroundService(IServiceProvider serviceProvider, ILogger<RecurringInvoiceBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Recurring Invoice Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRecurringInvoicesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred processing recurring invoices.");
            }

            // Run every 1 hour (or customize)
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task ProcessRecurringInvoicesAsync(CancellationToken stoppingToken)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var sender = scope.ServiceProvider.GetRequiredService<ISender>();

            var now = DateTime.UtcNow;
            
            // Find active recurring profiles due for run
            var dueProfiles = await context.RecurringInvoices
                .Include(r => r.Items)
                .Where(r => r.Status == RecurringStatus.Active && r.NextRunDate <= now)
                .ToListAsync(stoppingToken);

            foreach (var profile in dueProfiles)
            {
                _logger.LogInformation($"Processing Recurring Invoice Profile: {profile.ProfileName}");

                // Create Invoice Command
                var invoiceDto = new CreateInvoiceDto
                {
                    CustomerId = profile.CustomerId,
                    SalesOrderId = null, // Direct Invoice
                    InvoiceDate = now,
                    DueDate = now.AddDays(30), // Default 30 days or parse PaymentTerms
                    Items = profile.Items.Select(i => new CreateInvoiceLineDto
                    {
                        ItemId = i.ItemId,
                        Description = i.Description,
                        Quantity = i.Quantity,
                        Rate = i.Rate,
                        TaxRate = i.TaxRate,
                        SalesOrderItemId = null
                    }).ToList()
                };

                try
                {
                    await sender.Send(new CreateInvoiceCommand(invoiceDto), stoppingToken);

                    // Update Next Run Date
                    profile.LastRunDate = now;
                    profile.NextRunDate = CalculateNextRunDate(profile.NextRunDate, profile.Interval);
                    
                    if (profile.EndDate.HasValue && profile.NextRunDate > profile.EndDate.Value)
                    {
                        profile.Status = RecurringStatus.Stopped;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to create invoice for profile {profile.Id}");
                }
            }

            if (dueProfiles.Any())
            {
                await context.SaveChangesAsync(stoppingToken);
            }
        }
    }

    private DateTime CalculateNextRunDate(DateTime current, RecurringInterval interval)
    {
        return interval switch
        {
            RecurringInterval.Daily => current.AddDays(1),
            RecurringInterval.Weekly => current.AddDays(7),
            RecurringInterval.Monthly => current.AddMonths(1),
            RecurringInterval.Quarterly => current.AddMonths(3),
            RecurringInterval.Yearly => current.AddYears(1),
            _ => current.AddMonths(1)
        };
    }
}
