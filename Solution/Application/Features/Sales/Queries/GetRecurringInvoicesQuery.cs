using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetRecurringInvoicesQuery : IRequest<List<RecurringInvoiceDto>>;

public class GetRecurringInvoicesQueryHandler : IRequestHandler<GetRecurringInvoicesQuery, List<RecurringInvoiceDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRecurringInvoicesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RecurringInvoiceDto>> Handle(GetRecurringInvoicesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _context.RecurringInvoices
            .Include(x => x.Items)
            .OrderByDescending(x => x.StartDate)
            .ToListAsync(cancellationToken);

        // We need customer names.
        // Assuming there is a way to get them. If Customers are in 'Parties', we might need to join or fetch separately.
        // For simplicity, let's just query or if Party is a navigation property (which it likely isn't directly if in different modules or loose coupling, but usually it is).
        // Let's assume we need to join with Parties if it's in the same context.
        // IApplicationDbContext likely has Parties.

        // Actually, checking SalesOrder queries might reveal how CustomerName is fetched. 
        // Usually it's via a Join or navigation property if configured.
        // Let's assume no navigation property for now and fetching minimal info or assuming we can join manually if needed.
        // But to keep it simple and safe, I will just return DTO without CustomerName populated from DB join if it's hard, 
        // BUT the UI needs it.
        
        // Let's check if Parties is in context. Yes IApplicationDbContext should have it.
        
        var parties = await _context.Parties.ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);

        return entities.Select(e => new RecurringInvoiceDto
        {
            Id = e.Id,
            ProfileName = e.ProfileName,
            CustomerId = e.CustomerId,
            CustomerName = parties.ContainsKey(e.CustomerId) ? parties[e.CustomerId] : "Unknown",
            Interval = e.Interval.ToString(),
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            LastRunDate = e.LastRunDate,
            NextRunDate = e.NextRunDate,
            Status = e.Status.ToString(),
            PaymentTerms = e.PaymentTerms,
            TotalAmount = e.TotalAmount,
            Items = e.Items.Select(i => new RecurringInvoiceItemDto
            {
                Id = i.Id,
                ItemId = i.ItemId,
                Description = i.Description,
                Quantity = i.Quantity,
                Rate = i.Rate,
                TaxRate = i.TaxRate,
                TaxAmount = i.TaxAmount,
                Amount = i.Amount
            }).ToList()
        }).ToList();
    }
}
