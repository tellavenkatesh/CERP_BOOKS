import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Trash, Plus } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { getParties } from "@/api/masters";
import { getItems } from "@/api/masters";
import { getBills, createDebitNote } from "@/api/purchase";

const formSchema = z.object({
    debitNoteDate: z.string().min(1, "Date is required"),
    vendorId: z.string().min(1, "Vendor is required"),
    billId: z.string().optional(),
    reason: z.string().optional(),
    lines: z.array(z.object({
        itemId: z.string().min(1, "Item is required"),
        description: z.string().optional(),
        quantity: z.coerce.number().min(1, "Qty must be > 0"),
        rate: z.coerce.number().min(0, "Rate must be >= 0"),
        taxRate: z.coerce.number().min(0, "Tax Rate must be >= 0"),
    })).min(1, "At least one item required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function DebitNoteForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Queries
    const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: getParties });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
    const { data: bills = [] } = useQuery({ queryKey: ["bills"], queryFn: getBills });

    const vendors = parties.filter(p => p.type === 1); // 1 = Vendor

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            debitNoteDate: format(new Date(), "yyyy-MM-dd"),
            vendorId: "",
            billId: "",
            reason: "",
            lines: [{ itemId: "", description: "", quantity: 1, rate: 0, taxRate: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    const watchVendorId = form.watch("vendorId");
    const watchBillId = form.watch("billId");

    // Filter Bills by Vendor
    const filteredBills = bills.filter(b => b.vendorId === watchVendorId);

    // Auto-fill from Bill if selected
    useEffect(() => {
        if (watchBillId) {
            const bill = bills.find(b => b.id === watchBillId);
            if (bill) {
                // Pre-fill items from Bill
                const lines = bill.items.map(item => ({
                    itemId: item.itemId,
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.rate,
                    taxRate: item.taxRate
                }));
                replace(lines);
            }
        }
    }, [watchBillId, bills, replace]);


    const mutation = useMutation({
        mutationFn: (values: FormValues) => createDebitNote({
            ...values,
            lines: values.lines.map(l => ({
                ...l,
                description: l.description || ""
            }))
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["debit-notes"] });
            navigate("/purchase/debit-notes");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to create Debit Note");
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
                    <CardTitle>Create Debit Note</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="debitNoteDate"
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                                </FormControl>
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
                                    name="billId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bill (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select Bill" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredBills.map(b => <SelectItem key={b.id} value={b.id}>{b.billNumber}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reason</FormLabel>
                                            <FormControl><Textarea {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Lines Grid */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Items</h3>
                                <div className="border rounded-md p-4">
                                    <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
                                        <div className="col-span-4">Item</div>
                                        <div className="col-span-2">Description</div>
                                        <div className="col-span-2">Quantity</div>
                                        <div className="col-span-2">Rate</div>
                                        <div className="col-span-1">Tax %</div>
                                        <div className="col-span-1">Action</div>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-4 mb-2 items-center">
                                            <div className="col-span-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.itemId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {items.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.description`}
                                                    render={({ field }) => (
                                                        <Input {...field} />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <Input type="number" {...field} />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.rate`}
                                                    render={({ field }) => (
                                                        <Input type="number" {...field} />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.taxRate`}
                                                    render={({ field }) => (
                                                        <Input type="number" {...field} />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: "", description: "", quantity: 1, rate: 0, taxRate: 0 })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/purchase/debit-notes")}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Create Debit Note"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
