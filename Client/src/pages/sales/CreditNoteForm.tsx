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
import { getInvoices } from "@/api/sales"; // Assuming we can list invoices to link
import { createCreditNote } from "@/api/sales";

const formSchema = z.object({
    creditNoteDate: z.string().min(1, "Date is required"),
    customerId: z.string().min(1, "Customer is required"),
    invoiceId: z.string().optional(),
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

export default function CreditNoteForm() {
    // const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Queries
    const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: getParties });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
    const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: getInvoices });

    const customers = parties.filter(p => p.type === 0); // 0 = Customer

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            creditNoteDate: format(new Date(), "yyyy-MM-dd"),
            customerId: "",
            invoiceId: "",
            reason: "",
            lines: [{ itemId: "", description: "", quantity: 1, rate: 0, taxRate: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    const watchCustomerId = form.watch("customerId");
    const watchInvoiceId = form.watch("invoiceId");

    // Filter Invoices by Customer
    const filteredInvoices = invoices.filter(inv => inv.customerId === watchCustomerId);

    // Auto-fill from Invoice if selected
    useEffect(() => {
        if (watchInvoiceId) {
            const invoice = invoices.find(inv => inv.id === watchInvoiceId);
            if (invoice) {
                // Pre-fill items from invoice
                const lines = invoice.items.map(item => ({
                    itemId: item.itemId,
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.rate, // Assuming 'rate' exists on invoice item
                    taxRate: item.taxRate
                }));
                // Only replace if lines are empty or user wants to (simplified: always replace on invoice select)
                replace(lines);
            }
        }
    }, [watchInvoiceId, invoices, replace]);


    const mutation = useMutation({
        mutationFn: (values: FormValues) => createCreditNote({
            ...values,
            invoiceId: values.invoiceId || undefined,
            lines: values.lines.map(l => ({
                ...l,
                description: l.description || ""
            }))
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
            navigate("/sales/credit-notes");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to create Credit Note");
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
                    <CardTitle>Create Credit Note</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="creditNoteDate"
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
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="invoiceId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>invoice (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select Invoice" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredInvoices.map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.invoiceNumber}</SelectItem>)}
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
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.rate`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`lines.${index}.taxRate`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
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
                                <Button type="button" variant="outline" onClick={() => navigate("/sales/credit-notes")}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Create Credit Note"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
