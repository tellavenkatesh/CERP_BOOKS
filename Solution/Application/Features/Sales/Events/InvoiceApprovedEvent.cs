using MediatR;
using System;

namespace CompreoBooks.Application.Features.Sales.Events;

public record InvoiceApprovedEvent(Guid InvoiceId) : INotification;
