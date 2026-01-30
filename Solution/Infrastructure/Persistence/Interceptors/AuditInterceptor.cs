using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CompreoBooks.Infrastructure.Persistence.Interceptors;

public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateAuditEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateAuditEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }


    private void UpdateAuditEntities(DbContext? context)
    {
        if (context == null) return;

        var user = _currentUserService.UserName ?? _currentUserService.UserId ?? "Anonymous";
        var ipAddress = _currentUserService.IpAddress ?? "Unknown";
        var timestamp = DateTime.UtcNow;

        var entries = context.ChangeTracker.Entries<object>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            if (entry.Entity is AuditLog) continue;

            var auditEntry = new AuditLog
            {
                Id = Guid.NewGuid(),
                EntityName = entry.Entity.GetType().Name,
                Action = entry.State.ToString(),
                UserId = user,
                IpAddress = ipAddress,
                Timestamp = timestamp,
                EntityId = GetEntityId(entry)
            };

            if (entry.State == EntityState.Modified)
            {
                var oldValues = new System.Collections.Generic.Dictionary<string, object?>();
                var newValues = new System.Collections.Generic.Dictionary<string, object?>();

                foreach (var property in entry.Properties)
                {
                    if (property.IsModified)
                    {
                        oldValues[property.Metadata.Name] = property.OriginalValue;
                        newValues[property.Metadata.Name] = property.CurrentValue;
                    }
                }
                
                auditEntry.OldValues = System.Text.Json.JsonSerializer.Serialize(oldValues);
                auditEntry.NewValues = System.Text.Json.JsonSerializer.Serialize(newValues);
            }
            else if (entry.State == EntityState.Added)
            {
                var newValues = new System.Collections.Generic.Dictionary<string, object?>();
                foreach (var property in entry.Properties)
                {
                   if (!property.IsTemporary)
                   {
                       newValues[property.Metadata.Name] = property.CurrentValue;
                   }
                }
                auditEntry.NewValues = System.Text.Json.JsonSerializer.Serialize(newValues);
                auditEntry.OldValues = "{}";
            }
             else if (entry.State == EntityState.Deleted)
            {
                var oldValues = new System.Collections.Generic.Dictionary<string, object?>();
                foreach (var property in entry.Properties)
                {
                     oldValues[property.Metadata.Name] = property.OriginalValue;
                }
                auditEntry.OldValues = System.Text.Json.JsonSerializer.Serialize(oldValues);
                auditEntry.NewValues = "{}";
            }
            
            context.Set<AuditLog>().Add(auditEntry);
        }
    }

    private string GetEntityId(EntityEntry entry)
    {
        var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
        return primaryKey?.CurrentValue?.ToString() ?? "Unknown";
    }
}
