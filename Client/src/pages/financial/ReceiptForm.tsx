import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getParties } from "@/api/masters";
import { getInvoices } from "@/api/sales";
import { createReceipt, PaymentMode } from "@/api/financial";

const formSchema = z.object({
    receiptDate: z.string().min(1, "Date is required"),
    customerId: z.string().min(1, "Customer is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    paymentMode: z.coerce.number(), // Enum value
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
    allocations: z.array(z.object({
        invoiceId: z.string(),
        amount: z.number()
    })).optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function ReceiptForm() {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allocations, setAllocations] = useState<Record<string, number>>({});

    // Fetch Customers
    const { data: parties = [] } = useQuery({
        queryKey: ["parties"],
        queryFn: getParties,
    });
    const customers = parties.filter(p => p.type === 0); // 0 = Customer

    // Fetch Invoices
    const { data: invoices = [] } = useQuery({
        queryKey: ["invoices"],
        queryFn: getInvoices,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            receiptDate: format(new Date(), "yyyy-MM-dd"),
            amount: 0,
            paymentMode: 0, // Cash
        },
    });

    const selectedCustomerId = form.watch("customerId");
    const receiptAmount = form.watch("amount");

    // Filter Outstanding Invoices for selected Customer
    const outstandingInvoices = invoices.filter(inv =>
        inv.customerId === selectedCustomerId && inv.balanceAmount > 0
    );

    const handleAllocationChange = (invoiceId: string, amount: number) => {
        setAllocations(prev => ({
            ...prev,
            [invoiceId]: amount
        }));
    };

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    const unappliedAmount = (receiptAmount || 0) - totalAllocated;

    const mutation = useMutation({
        mutationFn: (values: FormValues) => createReceipt({
            ...values,
            paymentMode: Number(values.paymentMode) as PaymentMode,
            // allocations: Object.entries(allocations).map(([id, amount]) => ({ invoiceId: id, amount })) // Backend doesn't support this yet
        }),
        onSuccess: () => {
            console.log("Receipt created successfully");
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            navigate("/financial/receipts");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to create receipt");
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(values);
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create Receipt</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="receiptDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <Select onValueChange={(val) => {
                                                field.onChange(val);
                                                setAllocations({}); // Reset allocations on customer change
                                            }} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id}>
                                                            {customer.name}
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
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
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
                                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Mode" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={String(PaymentMode.Cash)}>Cash</SelectItem>
                                                    <SelectItem value={String(PaymentMode.BankTransfer)}>Bank Transfer</SelectItem>
                                                    <SelectItem value={String(PaymentMode.Cheque)}>Cheque</SelectItem>
                                                    <SelectItem value={String(PaymentMode.UPI)}>UPI</SelectItem>
                                                    <SelectItem value={String(PaymentMode.CreditCard)}>Credit Card</SelectItem>
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
                                            <FormLabel>Reference #</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cheque no / Transaction ID" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Remarks" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Invoice Allocation Section */}
                            {selectedCustomerId && (
                                <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                                    <h3 className="font-medium text-lg">Invoice Allocation</h3>
                                    {outstandingInvoices.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No outstanding invoices found for this customer.</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Invoice #</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="text-right">Balance</TableHead>
                                                    <TableHead className="text-right w-[150px]">Allocate</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {outstandingInvoices.map(inv => (
                                                    <TableRow key={inv.id}>
                                                        <TableCell>{inv.invoiceNumber}</TableCell>
                                                        <TableCell>{format(new Date(inv.invoiceDate), 'dd/MM/yyyy')}</TableCell>
                                                        <TableCell className="text-right">{inv.totalAmount.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right">{inv.balanceAmount.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                className="text-right h-8"
                                                                value={allocations[inv.id] || ''}
                                                                onChange={(e) => handleAllocationChange(inv.id, parseFloat(e.target.value) || 0)}
                                                                max={inv.balanceAmount}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                    <div className="flex justify-end gap-8 text-sm font-medium pt-2">
                                        <div>Allocated: {totalAllocated.toFixed(2)}</div>
                                        <div className={unappliedAmount < 0 ? "text-red-500" : "text-gray-600"}>
                                            Unapplied: {unappliedAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/financial/receipts")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Create Receipt"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
