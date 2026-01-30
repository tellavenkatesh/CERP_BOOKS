import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from 'sonner';

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { getParties, getCompanies } from "@/api/masters";
import { getItems } from "@/api/masters";
import { getSalesOrders, getSalesOrderById, createInvoice, getPendingDeliveryChallans } from "@/api/sales";
import { getDeliveryChallanById } from "@/api/sales";

const itemSchema = z.object({
    itemId: z.string().min(1, "Item is required"),
    description: z.string().optional(),
    quantity: z.number().min(0.01, "Qty must be > 0"),
    rate: z.number().min(0),
    taxRate: z.number().min(0),
    amount: z.number(),
    salesOrderItemId: z.string().optional().nullable(),
    deliveryChallanLineId: z.string().optional().nullable()
});

const formSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    salesOrderId: z.string().optional(),
    deliveryChallanId: z.string().optional(),
    invoiceDate: z.string().min(1, "Date is required"),
    dueDate: z.string().min(1, "Due Date is required"),
    referenceNumber: z.string().optional(),
    placeOfSupply: z.string().optional(),
    paymentTerms: z.string().optional(),
    salesperson: z.string().optional(),

    shippingCharges: z.number().optional(),
    adjustment: z.number().optional(),
    roundOff: z.number().optional(),

    customerNotes: z.string().optional(),
    termsAndConditions: z.string().optional(),

    items: z.array(itemSchema).min(1, "At least one item required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function InvoiceForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const salesOrderIdParam = searchParams.get('salesOrderId');
    const deliveryChallanIdParam = searchParams.get('deliveryChallanId');

    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingAddress, setShippingAddress] = useState<string>('');
    const [billingAddress, setBillingAddress] = useState<string>('');

    // Queries
    const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: getParties });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
    const { data: salesOrders = [] } = useQuery({ queryKey: ["sales-orders"], queryFn: getSalesOrders });

    const customers = parties.filter(p => p.type === 0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceDate: format(new Date(), "yyyy-MM-dd"),
            dueDate: format(new Date(), "yyyy-MM-dd"),
            customerId: "",
            salesOrderId: salesOrderIdParam || "",
            referenceNumber: "",
            placeOfSupply: "",
            paymentTerms: "Due on Receipt",
            salesperson: "",
            shippingCharges: 0,
            adjustment: 0,
            roundOff: 0,
            customerNotes: "Thanks for your business.",
            termsAndConditions: "",
            items: [{ itemId: "", description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchCustomerId = useWatch({ control: form.control, name: "customerId" });
    const formLines = useWatch({ control: form.control, name: "items" });
    const watchShipping = useWatch({ control: form.control, name: "shippingCharges" }) || 0;
    const watchAdjustment = useWatch({ control: form.control, name: "adjustment" }) || 0;
    const watchRoundOff = useWatch({ control: form.control, name: "roundOff" }) || 0;

    // Filter Sales Orders
    const filteredSalesOrders = salesOrders.filter(so => so.customerId === watchCustomerId);

    const { data: pendingDCs = [] } = useQuery({
        queryKey: ["pending-dcs", watchCustomerId],
        queryFn: () => watchCustomerId ? getPendingDeliveryChallans(watchCustomerId) : Promise.resolve([]),
        enabled: !!watchCustomerId
    });

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            form.setValue('customerId', customerId);
            form.setValue('placeOfSupply', customer.billingState || '');

            // Billing Address
            const billingParts = [
                customer.billingAddress, customer.billingCity, customer.billingState, customer.billingPincode, customer.billingCountry
            ].filter(Boolean);
            setBillingAddress(billingParts.join('\n'));

            // Shipping Address
            const shippingParts = [
                customer.shippingAddress, customer.shippingCity, customer.shippingState, customer.shippingPincode, customer.shippingCountry
            ].filter(Boolean);
            setShippingAddress(shippingParts.join('\n'));

            // Reset Related Fields
            form.setValue('deliveryChallanId', '');
            form.setValue('salesOrderId', '');
            form.setValue('items', [{ itemId: "", description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0 }]);
        }
    };

    const handleDCChange = (dcId: string) => {
        form.setValue("deliveryChallanId", dcId);
        const dc = pendingDCs.find(d => d.id === dcId);
        if (dc) {
            if (dc.salesOrderId) form.setValue("salesOrderId", dc.salesOrderId);
            if (dc.referenceNumber) form.setValue("referenceNumber", dc.referenceNumber);

            const lines = dc.lines.map(l => ({
                itemId: l.itemId,
                description: l.description,
                quantity: l.quantity,
                rate: l.rate,
                taxRate: l.taxRate,
                amount: l.quantity * l.rate,
                salesOrderItemId: l.salesOrderItemId,
                deliveryChallanLineId: l.id
            }));

            replace(lines);
        }
    };

    // Auto-fill from Params
    useEffect(() => {
        const load = async () => {
            if (salesOrderIdParam) {
                const so = await getSalesOrderById(salesOrderIdParam);
                if (so) {
                    form.setValue("customerId", so.customerId);
                    handleCustomerChange(so.customerId);
                    form.setValue("placeOfSupply", so.placeOfSupply || "");

                    const lines = so.items.map(i => ({
                        itemId: i.itemId,
                        description: i.description,
                        quantity: i.quantity - (i.quantityInvoiced || 0),
                        rate: i.unitPrice,
                        taxRate: i.taxRate,
                        amount: (i.quantity - (i.quantityInvoiced || 0)) * i.unitPrice,
                        salesOrderItemId: i.id
                    })).filter(i => i.quantity > 0);
                    replace(lines);
                }
            } else if (deliveryChallanIdParam) {
                const dc = await getDeliveryChallanById(deliveryChallanIdParam);
                if (dc) {
                    form.setValue("customerId", dc.customerId);
                    handleCustomerChange(dc.customerId);

                    // Get Price from Item Master or SO if linked
                    // For simplicity, using Item Master price if no SO
                    const lines = dc.lines.map(l => {
                        const item = items.find(i => i.id === l.itemId);
                        const price = item ? item.salesPrice : 0;
                        return {
                            itemId: l.itemId,
                            description: l.description,
                            quantity: l.deliveredQuantity,
                            rate: price,
                            taxRate: 0, // Should fetch from item
                            amount: l.deliveredQuantity * price,
                            salesOrderItemId: l.salesOrderItemId
                        };
                    });
                    replace(lines);
                }
            }
        };
        load();
    }, [salesOrderIdParam, deliveryChallanIdParam, replace, items]);

    const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: getCompanies });
    const companyState = companies?.[0]?.state?.trim().toUpperCase();
    const pos = (useWatch({ control: form.control, name: 'placeOfSupply' }) || '').trim().toUpperCase();
    const isIntraState = companyState && pos && companyState === pos;

    // Calculations
    const subTotal = formLines.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxTotal = formLines.reduce((sum, item) => sum + ((item.amount || 0) * ((item.taxRate || 0) / 100)), 0);

    // Tax Breakdown
    let cgst = 0, sgst = 0, igst = 0;
    if (isIntraState) {
        cgst = taxTotal / 2;
        sgst = taxTotal / 2;
    } else {
        igst = taxTotal;
    }

    const total = subTotal + taxTotal + watchShipping + watchAdjustment + watchRoundOff;

    const mutation = useMutation({
        mutationFn: (values: FormValues) => createInvoice({
            ...values,
            salesOrderId: values.salesOrderId || undefined,
            shippingCharges: values.shippingCharges || 0,
            adjustment: values.adjustment || 0,
            roundOff: values.roundOff || 0,
            items: values.items.map(i => ({
                itemId: i.itemId,
                description: i.description || "",
                quantity: i.quantity,
                rate: i.rate,
                taxRate: i.taxRate,
                salesOrderItemId: i.salesOrderItemId || undefined
            }))
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice Created Successfully!");
            navigate("/sales/invoices");
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to create Invoice");
            setIsSubmitting(false);
        }
    });

    const onSubmit = (data: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(data);
    };

    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            form.setValue(`items.${index}.itemId`, itemId);
            form.setValue(`items.${index}.description`, item.name);
            form.setValue(`items.${index}.rate`, item.salesPrice);
            form.setValue(`items.${index}.quantity`, 1);
            form.setValue(`items.${index}.taxRate`, 0); // TODO: Fetch Tax Code
            form.setValue(`items.${index}.amount`, item.salesPrice);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">New Invoice</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">

                    {/* Header Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left: Customer */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-red-500">Customer Name*</FormLabel>
                                        <div className="flex gap-2">
                                            <Select onValueChange={handleCustomerChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customers.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Billing Address</p>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line min-h-[60px]">
                                        {billingAddress || <span className="text-gray-400 italic">--</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Shipping Address</p>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line min-h-[60px]">
                                        {shippingAddress || <span className="text-gray-400 italic">--</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Invoice Details */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label className="text-gray-600">Invoice#*</Label>
                                <Input disabled placeholder="Auto-generated" className="bg-gray-50" />
                            </div>

                            <FormField
                                control={form.control}
                                name="deliveryChallanId"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Link DC</FormLabel>
                                        <Select onValueChange={handleDCChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select DC" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {pendingDCs.map(dc => (
                                                    <SelectItem key={dc.id} value={dc.id}>{dc.challanNumber}</SelectItem>
                                                ))}
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
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Order Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="invoiceDate"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Invoice Date*</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentTerms"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Terms</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Terms" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                                <SelectItem value="Net 15">Net 15</SelectItem>
                                                <SelectItem value="Net 30">Net 30</SelectItem>
                                                <SelectItem value="Net 45">Net 45</SelectItem>
                                                <SelectItem value="Net 60">Net 60</SelectItem>
                                                <SelectItem value="Custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Due Date*</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="salesperson"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Salesperson</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Select or Add" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Items Grid */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                                    <tr>
                                        <th className="py-2 px-4 text-left w-[30%]">Item Details</th>
                                        <th className="py-2 px-4 text-right">Quantity</th>
                                        <th className="py-2 px-4 text-right">Rate</th>
                                        <th className="py-2 px-4 text-right">Tax (%)</th>
                                        <th className="py-2 px-4 text-right">Amount</th>
                                        <th className="py-2 px-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-gray-700">
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="group hover:bg-white">
                                            <td className="p-2 align-top">
                                                <div className="space-y-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.itemId`}
                                                        render={({ field: itemField }) => (
                                                            <FormItem className="space-y-0">
                                                                <Select
                                                                    value={itemField.value}
                                                                    onValueChange={(val) => handleItemChange(index, val)}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="border-0 bg-transparent shadow-none p-0 h-auto font-medium text-blue-600 hover:text-blue-800 focus:ring-0">
                                                                            <SelectValue placeholder="Select item" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.description`}
                                                        render={({ field: descField }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input
                                                                        {...descField}
                                                                        className="border-0 bg-transparent shadow-none p-0 h-auto text-gray-500 placeholder:text-gray-300 focus-visible:ring-0"
                                                                        placeholder="Description"
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        form.setValue(`items.${index}.quantity`, val);
                                                        form.setValue(`items.${index}.amount`, val * form.watch(`items.${index}.rate`));
                                                    }}
                                                    className="text-right border-gray-200"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        form.setValue(`items.${index}.rate`, val);
                                                        form.setValue(`items.${index}.amount`, val * form.watch(`items.${index}.quantity`));
                                                    }}
                                                    className="text-right border-gray-200"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.taxRate`, { valueAsNumber: true })}
                                                    className="text-right border-gray-200"
                                                />
                                            </td>
                                            <td className="p-2 align-top text-right font-medium">
                                                {new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(form.watch(`items.${index}.amount`) || 0)}
                                            </td>
                                            <td className="p-2 align-top text-center">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: "", description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0 })}>
                            <Plus className="h-4 w-4 mr-2" /> Add New Row
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        {/* Notes & Terms */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="customerNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[80px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="termsAndConditions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Terms & Conditions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Enter the terms and conditions..." className="min-h-[80px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Totals Box */}
                        <div className="bg-gray-50/50 p-6 rounded-lg space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Sub Total</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subTotal)}</span>
                            </div>

                            {isIntraState ? (
                                <>
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">CGST</span>
                                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cgst)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">SGST</span>
                                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(sgst)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center text-sm gap-4">
                                    <span className="text-gray-600">IGST</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(igst)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm gap-4">
                                <span className="text-gray-600">Shipping Charges</span>
                                <Input
                                    type="number"
                                    {...form.register('shippingCharges', { valueAsNumber: true })}
                                    className="w-32 text-right h-8 bg-white"
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm gap-4">
                                <span className="text-gray-600">Adjustment</span>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        {...form.register('adjustment', { valueAsNumber: true })}
                                        className="w-32 text-right h-8 bg-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm gap-4">
                                <span className="text-gray-600">Round Off</span>
                                <Input
                                    type="number"
                                    {...form.register('roundOff', { valueAsNumber: true })}
                                    className="w-32 text-right h-8 bg-white"
                                />
                            </div>

                            <div className="flex justify-between text-lg font-bold border-t pt-4">
                                <span>Total ( ₹ )</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-start gap-4 pt-6 border-t -mx-6 px-6 bg-gray-50/50 py-4 sticky bottom-0">
                        <Button type="button" variant="outline" onClick={() => navigate("/sales/invoices")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                            {mutation.isPending ? "Saving..." : "Save and Send"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
