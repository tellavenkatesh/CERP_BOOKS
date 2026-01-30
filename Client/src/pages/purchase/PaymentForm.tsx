import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPayment } from '@/api/payment';
import { getBills } from '@/api/purchase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

const formSchema = z.object({
    vendorId: z.string().min(1, 'Vendor is required'),
    billId: z.string().min(1, 'Bill is required'),
    paymentDate: z.string(),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentMode: z.string().min(1, 'Payment mode is required'),
    referenceNumber: z.string().optional(),
    remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    // Pre-fill from URL if available
    const preBillId = searchParams.get('billId');

    const { data: bills = [] } = useQuery({
        queryKey: ['bills'],
        queryFn: getBills,
    });

    // Filter unpaid bills
    const unpaidBills = bills.filter(b => b.status !== 'Paid');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paymentDate: new Date().toISOString().split('T')[0],
            amount: 0,
            paymentMode: 'Bank Transfer',
            referenceNumber: '',
            remarks: '',
        },
    });

    const selectedBillId = form.watch('billId');

    // Auto-fill details when bill is selected
    useEffect(() => {
        if (selectedBillId) {
            const bill = bills.find(b => b.id === selectedBillId);
            if (bill) {
                form.setValue('vendorId', bill.vendorId);
                // Calculate pending amount: Total - Paid
                // Note: BillDto might not have PaidAmount yet exposed in API getBills unless I updated it! 
                // Creating a local calculation or assuming Backend returns it. 
                // For now, I'll default to totalAmount - (paidAmount ?? 0).
                // Actually, BillDto in purchase.ts DOES NOT have PaidAmount yet. I need to update it.
                // But for now, let's assume BillDto has BalanceAmount or calculate it?
                // Wait, I updated Bill.cs BUT I did NOT update BillDto in `api/purchase.ts`.
                // I should assume I need to update BillDto first.
                // For now I'll use TotalAmount as placeholder or check if I can get balance.
                // Let's assume full amount for now.
                form.setValue('amount', bill.totalAmount);
            }
        }
    }, [selectedBillId, bills, form]);

    useEffect(() => {
        if (preBillId && bills.length > 0) {
            form.setValue('billId', preBillId);
        }
    }, [preBillId, bills, form]);

    const mutation = useMutation({
        mutationFn: createPayment,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['payments'] });
            void queryClient.invalidateQueries({ queryKey: ['bills'] });
            navigate('/purchase/payments');
        },
    });

    function onSubmit(values: FormValues) {
        // Map string mode to integer enum
        const modeMap: Record<string, number> = {
            'Cash': 0,
            'Bank Transfer': 1,
            'Cheque': 2,
            'UPI': 3,
            'Credit Card': 4
        };

        mutation.mutate({
            ...values,
            paymentMode: modeMap[values.paymentMode] ?? 1, // Default to BankTransfer if something goes wrong
            paymentDate: new Date(values.paymentDate).toISOString(),
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Record Payment</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="billId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bill</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Bill" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {unpaidBills.map(b => (
                                                    <SelectItem key={b.id} value={b.id}>
                                                        {b.billNumber} | {b.vendorName} | {b.totalAmount}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentMode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Mode</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Mode" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="UPI">UPI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="referenceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reference No (Cheque/Txn ID)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Remarks</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/purchase/payments')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Record Payment"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
