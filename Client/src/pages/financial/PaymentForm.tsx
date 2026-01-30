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
import { getParties, getTaxCodes } from "@/api/masters";
import { getBills } from "@/api/purchase";
import { createPayment, PaymentMode } from "@/api/financial";

const formSchema = z.object({
    paymentDate: z.string().min(1, "Date is required"),
    vendorId: z.string().min(1, "Vendor is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    paymentMode: z.coerce.number(),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
    tdsTaxCodeId: z.string().optional(),
    tdsRate: z.number().optional(),
    tdsAmount: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allocations, setAllocations] = useState<Record<string, number>>({});

    const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: getParties });
    const vendors = parties.filter(p => p.type === 1); // 1 = Vendor

    const { data: bills = [] } = useQuery({ queryKey: ["bills"], queryFn: getBills });

    const { data: taxCodes = [] } = useQuery({ queryKey: ["taxCodes"], queryFn: getTaxCodes });
    const tdsCategories = taxCodes.filter(tc => tc.isTds);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            paymentDate: format(new Date(), "yyyy-MM-dd"),
            amount: 0,
            paymentMode: 0,
        },
    });

    const selectedVendorId = form.watch("vendorId");
    const amount = form.watch("amount");
    const selectedTdsId = form.watch("tdsTaxCodeId");

    const [netAmount, setNetAmount] = useState(0);

    // Calculate TDS
    useEffect(() => {
        let currentTdsAmount = 0;
        if (selectedTdsId && selectedTdsId !== "none") {
            const tds = tdsCategories.find(t => t.id === selectedTdsId);
            if (tds) {
                const rate = tds.rate;
                currentTdsAmount = (amount * rate) / 100;
                form.setValue("tdsRate", rate);
                form.setValue("tdsAmount", currentTdsAmount);
            }
        } else {
            form.setValue("tdsRate", 0);
            form.setValue("tdsAmount", 0);
        }
        setNetAmount((amount || 0) - currentTdsAmount);
    }, [selectedTdsId, amount, tdsCategories, form]);

    // Filter Outstanding Bills
    // Assuming 'status' != 'Paid'. And assuming totalAmount covers it for now as we don't have balanceAmount
    const outstandingBills = bills.filter(b =>
        b.vendorId === selectedVendorId && b.status !== 'Paid'
    );

    const handleAllocationChange = (billId: string, allocAmount: number) => {
        setAllocations(prev => ({ ...prev, [billId]: allocAmount }));
    };

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    const unappliedAmount = netAmount - totalAllocated;

    const mutation = useMutation({
        mutationFn: (values: FormValues) => createPayment({
            ...values,
            paymentMode: Number(values.paymentMode) as PaymentMode
        }),
        onSuccess: () => {
            console.log("Payment created successfully");
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            navigate("/financial/payments");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to create payment");
        },
    });

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(values);
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Main Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="paymentDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vendorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vendor</FormLabel>
                                            <Select onValueChange={(val) => {
                                                field.onChange(val);
                                                setAllocations({});
                                            }} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
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
                                            <FormLabel>Gross Amount</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
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
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value={String(PaymentMode.Cash)}>Cash</SelectItem>
                                                    <SelectItem value={String(PaymentMode.BankTransfer)}>Bank Transfer</SelectItem>
                                                    <SelectItem value={String(PaymentMode.Cheque)}>Cheque</SelectItem>
                                                    <SelectItem value={String(PaymentMode.UPI)}>UPI</SelectItem>
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
                                            <FormControl><Input placeholder="Ref / Cheque #" {...field} /></FormControl>
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
                                            <FormControl><Input placeholder="Remarks" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* TDS Section */}
                            <div className="border rounded-md p-4 bg-muted/50 space-y-4">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">TDS Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="tdsTaxCodeId"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Applicable TDS Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select TDS Category (Optional)" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {tdsCategories.map(tc => <SelectItem key={tc.id} value={tc.id}>{tc.name} ({tc.rate}%)</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tdsRate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Rate (%)</FormLabel>
                                                <FormControl><Input disabled {...field} value={field.value || 0} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tdsAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>TDS Amount</FormLabel>
                                                <FormControl><Input disabled {...field} value={field.value?.toFixed(2) || "0.00"} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end items-center gap-2 font-bold text-lg">
                                    <span>Net Payment Amount:</span>
                                    <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(netAmount)}</span>
                                </div>
                            </div>

                            {/* Bill Allocation */}
                            {selectedVendorId && (
                                <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                                    <h3 className="font-medium text-lg">Bill Allocation</h3>
                                    {outstandingBills.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No outstanding bills found.</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Bill #</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="text-right w-[150px]">Allocate</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {outstandingBills.map(bill => (
                                                    <TableRow key={bill.id}>
                                                        <TableCell>{bill.billNumber} / {bill.vendorBillNumber}</TableCell>
                                                        <TableCell>{format(new Date(bill.billDate), 'dd/MM/yyyy')}</TableCell>
                                                        <TableCell className="text-right">{bill.totalAmount.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                className="text-right h-8"
                                                                value={allocations[bill.id] || ''}
                                                                onChange={(e) => handleAllocationChange(bill.id, parseFloat(e.target.value) || 0)}
                                                                max={bill.totalAmount}
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
                                            Unapplied (from Net): {unappliedAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/financial/payments")}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Create Payment"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
