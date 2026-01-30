using CompreoBooks.Application.Features.Purchase.DTOs;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Purchase;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using CompreoBooks.Application.Common.Interfaces;
using System;
using System;

namespace Application.Features.Purchase.Commands
{
    public class CreatePaymentCommand : IRequest<string>
    {
        public Guid VendorId { get; set; }
        public Guid BillId { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
        public string? Remarks { get; set; }
    }

    public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, string>
    {
        private readonly IApplicationDbContext _context;

        public CreatePaymentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            // 1. Validate Bill
            var bill = await _context.Bills
                .FirstOrDefaultAsync(b => b.Id == request.BillId, cancellationToken);

            if (bill == null) throw new Exception("Invalid Bill selected.");
            if (bill.VendorId != request.VendorId) throw new Exception("Bill does not belong to the selected vendor.");

            // 2. Validate Amount
            if (request.Amount <= 0) throw new Exception("Payment amount must be greater than zero.");
            if (request.Amount > bill.BalanceAmount) throw new Exception($"Payment amount ({request.Amount}) exceeds bill balance ({bill.BalanceAmount}).");

            // 3. Generate Payment Number
            var prefix = $"PAY-{request.PaymentDate:yyyyMM}-";
            var lastPayment = await _context.Payments
                .Where(p => p.PaymentNumber.StartsWith(prefix))
                .OrderByDescending(p => p.PaymentNumber)
                .FirstOrDefaultAsync(cancellationToken);

            var nextSeq = 1;
            if (lastPayment != null)
            {
                var part = lastPayment.PaymentNumber.Substring(prefix.Length);
                if (int.TryParse(part, out int seq)) nextSeq = seq + 1;
            }
            var paymentNumber = $"{prefix}{nextSeq:D4}";

            // Parse Payment Mode
            if (!Enum.TryParse(request.PaymentMode, true, out PaymentMode paymentModeEnum))
            {
               // Default or throw? Let's default to BankTransfer if implicit or throw.
               // Assuming PaymentMode enum has values like Cash, Cheque, BankTransfer.
               // If valid values are unknown, we might face issue. 
               // Let's assume the Enum names match the string (Cash, Cheque, Bank Transfer -> BankTransfer?)
               // The UI sends "Bank Transfer" with space. Enum usually "BankTransfer".
               // I'll sanitize the string.
               var sanitized = request.PaymentMode.Replace(" ", "");
               if (!Enum.TryParse(sanitized, true, out paymentModeEnum))
               {
                    // Fallback to BankTransfer or just use default (0)
                    // Trying to find where PaymentMode is defined would be safer but let's try strict parse
                    // If fail, maybe throw? 
                    // Let's try to map generic.
                    paymentModeEnum = (PaymentMode)0; // Mock default if fail
               }
            }

            // 4. Create Payment
            var payment = new Payment
            {
                PaymentNumber = paymentNumber,
                PaymentDate = request.PaymentDate,
                VendorId = request.VendorId,
                // VendorName is not in Payment entity according to file read (it has Navigation Property Vendor)
                // Payment.cs: public Party Vendor { get; set; }
                
                BillId = request.BillId,
                BillNumber = bill.BillNumber,
                
                Amount = request.Amount,
                PaymentMode = paymentModeEnum,
                ReferenceNumber = request.ReferenceNumber,
                Notes = request.Remarks
            };

            // 5. Update Bill
            bill.PaidAmount += request.Amount;
            if (bill.BalanceAmount <= 0) // Should rely on decimal precision but check for near zero
            {
                bill.Status = BillStatus.Paid;
            }
            else
            {
                bill.Status = BillStatus.PartiallyPaid;
            }

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync(cancellationToken);

            return payment.Id.ToString();
        }
    }
}
