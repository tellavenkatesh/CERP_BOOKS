import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { getParties } from "@/api/masters";
import { getItems } from "@/api/masters";
import { getSalesOrders, getSalesOrderById } from "@/api/sales";
import { createDeliveryChallan } from "@/api/sales";

const itemSchema = z.object({
    itemId: z.string().min(1, "Item is required"),
    description: z.string().optional(),
    salesOrderItemId: z.string().optional().nullable(),
    deliveredQuantity: z.number().min(0.01, "Qty must be > 0"),
    rate: z.number().min(0),
    taxRate: z.number().min(0),
    amount: z.number(),
    discount: z.number().optional()
});

const formSchema = z.object({
    challanDate: z.string().min(1, "Date is required"),
    customerId: z.string().min(1, "Customer is required"),
    salesOrderId: z.string().optional(),
    deliveryAddress: z.string().optional(),
    referenceNumber: z.string().optional(),
    placeOfSupply: z.string().optional(),
    challanType: z.string().optional(),
    purpose: z.coerce.number(),
    notes: z.string().optional(),
    adjustment: z.number().optional(),
    roundOff: z.number().optional(),
    lines: z.array(itemSchema).min(1, "At least one item required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function DeliveryChallanForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const salesOrderIdParam = searchParams.get('salesOrderId');

    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Queries
    const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: getParties });
    const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: getItems });
    const { data: salesOrders = [] } = useQuery({ queryKey: ["sales-orders"], queryFn: getSalesOrders });

    const customers = parties.filter(p => p.type === 0); // 0 = Customer

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            challanDate: format(new Date(), "yyyy-MM-dd"),
            customerId: "",
            salesOrderId: salesOrderIdParam || "",
            deliveryAddress: "",
            referenceNumber: "",
            placeOfSupply: "",
            challanType: "",
            purpose: 0, // Sale
            notes: "",
            adjustment: 0,
            roundOff: 0,
            lines: [{ itemId: "", description: "", deliveredQuantity: 1, rate: 0, taxRate: 0, amount: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    const watchCustomerId = useWatch({ control: form.control, name: "customerId" });
    const watchSalesOrderId = useWatch({ control: form.control, name: "salesOrderId" });
    const formLines = useWatch({ control: form.control, name: "lines" });
    const adjustment = useWatch({ control: form.control, name: "adjustment" }) || 0;

    const [shippingAddress, setShippingAddress] = useState<string>('');

    // Filter Sales Orders by Customer
    const filteredSalesOrders = salesOrders.filter(so => so.customerId === watchCustomerId);

    // Handle Customer Change
    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            form.setValue('customerId', customerId);
            form.setValue('placeOfSupply', customer.billingState || '');

            // Construct Shipping Address
            const shippingAddressParts = [
                customer.shippingAttention,
                customer.shippingAddress,
                customer.shippingStreet2,
                customer.shippingCity,
                customer.shippingState,
                customer.shippingPincode,
                customer.shippingCountry,
                customer.shippingPhone ? `Phone: ${customer.shippingPhone}` : ''
            ].filter(part => part && part.trim() !== '');
            const formattedShipping = shippingAddressParts.join('\n');
            setShippingAddress(formattedShipping);
            form.setValue('deliveryAddress', formattedShipping);
        }
    };

    // Auto-fill from Sales Order
    useEffect(() => {
        if (watchSalesOrderId) {
            getSalesOrderById(watchSalesOrderId).then(so => {
                form.setValue("customerId", so.customerId);
                // Also trigger address logic? Or trust SO address
                if (so.deliveryAddress) {
                    form.setValue("deliveryAddress", so.deliveryAddress);
                    setShippingAddress(so.deliveryAddress);
                }

                if (so.placeOfSupply) form.setValue("placeOfSupply", so.placeOfSupply);

                const lines = so.items.map(item => ({
                    itemId: item.itemId,
                    description: item.description,
                    salesOrderItemId: item.id,
                    deliveredQuantity: item.quantity - (item.quantityDelivered || 0), // Remaining qty
                    rate: item.unitPrice,
                    taxRate: item.taxRate,
                    amount: (item.quantity - (item.quantityDelivered || 0)) * item.unitPrice, // Calc amount based on remaining
                    discount: 0
                })).filter(l => l.deliveredQuantity > 0); // Only bring items with remaining qty

                if (lines.length > 0) {
                    replace(lines);
                } else {
                    toast.info("All items in this Sales Order have seemingly been delivered.");
                }
            });
        }
    }, [watchSalesOrderId, form, replace]);

    // Calculations
    const subTotal = formLines.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxTotal = formLines.reduce((sum, item) => sum + ((item.amount || 0) * (item.taxRate / 100)), 0);
    const total = subTotal + taxTotal + adjustment;

    const mutation = useMutation({
        mutationFn: (values: FormValues) => createDeliveryChallan({
            ...values,
            salesOrderId: values.salesOrderId || undefined,
            purpose: String(values.purpose),
            subTotal,
            taxAmount: taxTotal,
            totalAmount: total,
            lines: values.lines.map(l => ({
                itemId: l.itemId,
                description: l.description || "",
                deliveredQuantity: l.deliveredQuantity,
                orderedQuantity: 0,
                rate: l.rate,
                taxRate: l.taxRate,
                taxAmount: (l.amount * (l.taxRate / 100)),
                amount: l.amount,
                discount: l.discount || 0,
                salesOrderItemId: l.salesOrderItemId || undefined
            }))
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery-challans"] });
            toast.success("Delivery Challan Created Successfully!");
            navigate("/sales/delivery-challans");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create Challan");
            setIsSubmitting(false);
        },
    });

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(values);
    };

    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            form.setValue(`lines.${index}.itemId`, itemId);
            form.setValue(`lines.${index}.description`, item.name); // Or description
            form.setValue(`lines.${index}.rate`, item.salesPrice);
            form.setValue(`lines.${index}.taxRate`, 0); // Fetch tax
            form.setValue(`lines.${index}.deliveredQuantity`, 1);
            form.setValue(`lines.${index}.amount`, item.salesPrice);
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">New Delivery Challan</h2>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">

                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column */}
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
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Shipping Address</p>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {shippingAddress || <span className="text-gray-400 italic">Address will populate upon selection</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label className="text-gray-600">Delivery Challan#*</Label>
                                <Input disabled placeholder="Auto-generated" className="bg-gray-50" />
                            </div>

                            <FormField
                                control={form.control}
                                name="referenceNumber"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Reference#</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="challanDate"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Date*</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="challanType"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Challan Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Supply on Approval">Supply on Approval</SelectItem>
                                                <SelectItem value="Supply of Liquid Gas">Supply of Liquid Gas</SelectItem>
                                                <SelectItem value="Job Work">Job Work</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="placeOfSupply"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Place Of Supply</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="State Code" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="salesOrderId"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600">Link Sales Order</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Sales Order (Optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredSalesOrders.map(so => (
                                                    <SelectItem key={so.id} value={so.id}>
                                                        {so.orderNumber}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                                    <tr>
                                        <th className="py-2 px-4 text-left w-[35%]">Item Details</th>
                                        <th className="py-2 px-4 text-right">Quantity</th>
                                        <th className="py-2 px-4 text-right">Rate</th>
                                        <th className="py-2 px-4 text-right">Tax (%)</th>
                                        <th className="py-2 px-4 text-right">Amount</th>
                                        <th className="py-2 px-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="group hover:bg-gray-50/50">
                                            <td className="p-2 align-top">
                                                <div className="space-y-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`lines.${index}.itemId`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={(val) => handleItemChange(index, val)}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="border-0 shadow-none p-0 h-auto font-medium text-blue-600 hover:text-blue-800">
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
                                                        name={`lines.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        className="border-0 shadow-none p-0 h-auto text-gray-500 placeholder:text-gray-300 focus-visible:ring-0"
                                                                        placeholder="Description"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`lines.${index}.deliveredQuantity`, { valueAsNumber: true })}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        form.setValue(`lines.${index}.deliveredQuantity`, val);
                                                        form.setValue(`lines.${index}.amount`, val * form.watch(`lines.${index}.rate`));
                                                    }}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`lines.${index}.rate`, { valueAsNumber: true })}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        form.setValue(`lines.${index}.rate`, val);
                                                        form.setValue(`lines.${index}.amount`, val * form.watch(`lines.${index}.deliveredQuantity`));
                                                    }}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`lines.${index}.taxRate`, { valueAsNumber: true })}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top text-right font-medium text-gray-700">
                                                {new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(form.watch(`lines.${index}.amount`) || 0)}
                                            </td>
                                            <td className="p-2 align-top">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="hover:bg-red-50 hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: "", description: "", deliveredQuantity: 1, rate: 0, taxRate: 0, amount: 0 })}>
                            <Plus className="h-4 w-4 mr-2" /> Add New Row
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        {/* Notes */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Notes for customer..." className="min-h-[100px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50/50 p-6 rounded-lg space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Sub Total</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subTotal)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm gap-4">
                                <span className="text-gray-600">Adjustment</span>
                                <Input
                                    type="number"
                                    {...form.register('adjustment', { valueAsNumber: true })}
                                    className="w-32 text-right h-8"
                                />
                            </div>

                            <div className="flex justify-between text-lg font-bold border-t pt-4">
                                <span>Total ( ₹ )</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start gap-4 pt-6 border-t sticky bottom-0 bg-white py-4 -mx-6 px-6 shadow-top">
                        <Button type="button" variant="outline" onClick={() => navigate("/sales/delivery-challans")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || mutation.isPending} className="bg-blue-600 hover:bg-blue-700 w-32">
                            {mutation.isPending ? "Saving..." : "Save as Draft"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
