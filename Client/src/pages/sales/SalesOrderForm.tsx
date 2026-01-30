import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getParties, getItems, getCompanies } from '@/api/masters';
import { createSalesOrder, getSalesOrderById, updateSalesOrder, sendSalesOrder } from '@/api/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Send, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const itemSchema = z.object({
    itemId: z.string().min(1, 'Item is required'),
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    taxRate: z.number().min(0),
    amount: z.number(),
});

const formSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    orderDate: z.string(),
    expectedDeliveryDate: z.string().optional(),
    customerPONumber: z.string().optional(),
    deliveryAddress: z.string().optional(), // Maps to Shipping Address
    paymentTerms: z.string().optional(),
    orderType: z.string().default('Standard'),
    placeOfSupply: z.string().optional(),
    salesperson: z.string().optional(),
    customerNotes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    shippingCharges: z.number().optional(),
    adjustment: z.number().optional(),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SalesOrderForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [isSending, setIsSending] = useState(false);

    const { data: customers = [] } = useQuery({
        queryKey: ['parties', 'customers'],
        queryFn: getParties,
        select: (data) => data.filter(p => p.type === 0), // Filter customers
    });

    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const { data: existingOrder, isLoading: isLoadingOrder } = useQuery({
        queryKey: ['salesorder', id],
        queryFn: () => getSalesOrderById(id!),
        enabled: isEditMode,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerId: '',
            orderDate: new Date().toISOString().split('T')[0],
            orderType: 'Standard',
            expectedDeliveryDate: '',
            customerPONumber: '',
            deliveryAddress: '',
            paymentTerms: '',
            placeOfSupply: '',
            salesperson: '',
            customerNotes: '',
            termsAndConditions: '',
            shippingCharges: 0,
            adjustment: 0,
            items: [{ itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const selectedCustomerId = useWatch({ control: form.control, name: 'customerId' });
    const formItems = useWatch({ control: form.control, name: 'items' });
    const shippingCharges = useWatch({ control: form.control, name: 'shippingCharges' }) || 0;
    const adjustment = useWatch({ control: form.control, name: 'adjustment' }) || 0;

    const [billingAddress, setBillingAddress] = useState<string>('');
    const [shippingAddress, setShippingAddress] = useState<string>('');

    // Handle Customer Change & Address Population
    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            form.setValue('customerId', customerId);
            form.setValue('placeOfSupply', customer.billingState || '');
            form.setValue('paymentTerms', customer.paymentTermId?.toString() || ''); // Assuming paymentTerms is number or string

            // Construct Billing Address
            const billingAddressParts = [
                customer.billingAttention,
                customer.billingAddress,
                customer.billingStreet2,
                customer.billingCity,
                customer.billingState,
                customer.billingPincode,
                customer.billingCountry,
                customer.billingPhone ? `Phone: ${customer.billingPhone}` : ''
            ].filter(part => part && part.trim() !== '');
            setBillingAddress(billingAddressParts.join('\n'));

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

            // Set Delivery Address field for backend
            form.setValue('deliveryAddress', formattedShipping);
        }
    };

    // Populate form in Edit Mode
    useEffect(() => {
        if (existingOrder) {
            form.reset({
                customerId: existingOrder.customerId,
                orderDate: existingOrder.orderDate.split('T')[0],
                orderType: existingOrder.orderType,
                expectedDeliveryDate: existingOrder.expectedDeliveryDate ? existingOrder.expectedDeliveryDate.split('T')[0] : '',
                customerPONumber: existingOrder.customerPONumber || '',
                deliveryAddress: existingOrder.deliveryAddress || '',
                paymentTerms: existingOrder.paymentTerms || '',
                placeOfSupply: existingOrder.placeOfSupply || '',
                salesperson: existingOrder.salesperson || '',
                customerNotes: existingOrder.customerNotes || '',
                termsAndConditions: existingOrder.termsAndConditions || '',
                shippingCharges: existingOrder.shippingCharges || 0,
                adjustment: existingOrder.adjustment || 0,
                items: existingOrder.items.map(i => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    taxRate: i.taxRate,
                    amount: i.totalAmount
                })),
            });

            // Trigger address population logic visually if needed (or minimal set)
            const customer = customers.find(c => c.id === existingOrder.customerId);
            if (customer) {
                // Re-construct logic for display
                const billingAddressParts = [
                    customer.billingAttention,
                    customer.billingAddress,
                    customer.billingStreet2,
                    customer.billingCity,
                    customer.billingState,
                    customer.billingPincode,
                    customer.billingCountry,
                    customer.billingPhone ? `Phone: ${customer.billingPhone}` : ''
                ].filter(part => part && part.trim() !== '');
                setBillingAddress(billingAddressParts.join('\n'));

                // For shipping, we might want to use the stored deliveryAddress if available, or fall back to customer master
                // Prioritize stored delivery address if it matches pattern, otherwise use master? 
                // Simple approach: Use master for display if matches ID, but maybe stored address is better?
                // Actually, existingOrder.deliveryAddress IS the stored shipping address.
                setShippingAddress(existingOrder.deliveryAddress || '');
            }
        }
    }, [existingOrder, form, customers]);

    // Handle "Convert from Estimate"
    useEffect(() => {
        if (location.state?.fromEstimate) {
            const estimate = location.state.fromEstimate;
            const customer = customers.find(c => c.id === estimate.customerId);

            form.reset({
                customerId: estimate.customerId,
                orderDate: new Date().toISOString().split('T')[0],
                orderType: 'Standard',
                expectedDeliveryDate: '',
                customerPONumber: estimate.referenceNumber || '',
                deliveryAddress: '', // Will be set by handleCustomerChange
                paymentTerms: '',
                placeOfSupply: estimate.placeOfSupply || '',
                salesperson: estimate.salesperson || '',
                customerNotes: estimate.customerNotes || '',
                termsAndConditions: estimate.termsAndConditions || '',
                shippingCharges: estimate.shippingCharges || 0,
                adjustment: estimate.adjustment || 0,
                items: estimate.items.map((i: any) => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.rate,
                    taxRate: i.taxRate,
                    amount: i.amount
                })),
            });

            if (customer) {
                handleCustomerChange(customer.id);
            }
        }
    }, [location.state, form, customers]);

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const dto = {
                customerId: values.customerId,
                orderDate: new Date(values.orderDate).toISOString(),
                orderType: values.orderType || 'Standard',
                expectedDeliveryDate: values.expectedDeliveryDate ? new Date(values.expectedDeliveryDate).toISOString() : undefined,
                customerPONumber: values.customerPONumber || undefined,
                deliveryAddress: values.deliveryAddress || undefined,
                paymentTerms: values.paymentTerms || undefined,
                placeOfSupply: values.placeOfSupply || undefined,
                salesperson: values.salesperson || undefined,
                shippingCharges: values.shippingCharges,
                adjustment: values.adjustment,
                customerNotes: values.customerNotes,
                termsAndConditions: values.termsAndConditions,
                items: values.items.map(i => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    taxRate: i.taxRate
                }))
            };

            if (isEditMode) {
                await updateSalesOrder(id!, dto);
                return id!;
            } else {
                return await createSalesOrder(dto);
            }
        },
        onSuccess: async (data) => {
            const newId = isEditMode ? id : data;

            if (isSending && newId) {
                toast.success("Sales Order saved. Redirecting to email preview...");
                navigate(`/sales/orders/${newId}/email`);
            } else {
                toast.success(`Sales Order ${isEditMode ? 'updated' : 'created'} successfully!`);
                void queryClient.invalidateQueries({ queryKey: ['salesorders'] });
                navigate('/sales/orders');
            }

            void queryClient.invalidateQueries({ queryKey: ['salesorders'] });
            navigate('/sales/orders');
        },
        onError: () => {
            toast.error("Failed to save Sales Order.");
            setIsSending(false);
        }
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    const handleSaveAndSend = () => {
        setIsSending(true);
        form.handleSubmit(onSubmit as any)();
    };

    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            form.setValue(`items.${index}.itemId`, itemId);
            form.setValue(`items.${index}.description`, item.name);
            form.setValue(`items.${index}.unitPrice`, item.salesPrice);
            form.setValue(`items.${index}.quantity`, 1);
            form.setValue(`items.${index}.taxRate`, 0); // TODO: Fetch from item tax code
            form.setValue(`items.${index}.amount`, item.salesPrice);
        }
    };

    const { data: companies = [] } = useQuery({
        queryKey: ['companies'],
        queryFn: getCompanies,
    });
    const companyState = companies?.[0]?.state?.trim().toUpperCase();
    const pos = (useWatch({ control: form.control, name: 'placeOfSupply' }) || '').trim().toUpperCase();
    const isIntraState = companyState && pos && companyState === pos;

    // Calculations
    const subTotal = formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = formItems.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * (item.taxRate / 100)), 0);

    // Tax Breakdown
    // Note: This is an estimation for display. Backend handles precise rounding per item.
    let cgst = 0, sgst = 0, igst = 0;
    if (isIntraState) {
        cgst = taxTotal / 2;
        sgst = taxTotal / 2;
    } else {
        igst = taxTotal;
    }

    const total = subTotal + taxTotal + shippingCharges + adjustment;


    if (isEditMode && isLoadingOrder) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Sales Order' : 'New Sales Order'}</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">

                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control as any} // Cast safely
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-red-500">Customer Name*</FormLabel>
                                        <div className="flex gap-2">
                                            <Select onValueChange={handleCustomerChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select or Add Customer" />
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
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {billingAddress || <span className="text-gray-400 italic">Address will populate upon selection</span>}
                                    </div>
                                </div>
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
                            <FormField
                                control={form.control as any}
                                name="orderType" // Re-introduced OrderType from original SO Form
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-2 gap-4 items-center space-y-0">
                                        <FormLabel className="text-gray-600 font-normal">Order Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Standard">Standard (SO → DC → Inv)</SelectItem>
                                                <SelectItem value="Service">Service (SO → Inv)</SelectItem>
                                                <SelectItem value="GoodsAutoDC">Goods (Auto DC)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="customerPONumber"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Customer PO#</Label>
                                        <Input {...field} />
                                    </div>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="orderDate"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Sales Order Date*</Label>
                                        <Input type="date" {...field} />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="expectedDeliveryDate"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Expected Shipment</Label>
                                        <Input type="date" {...field} />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="paymentTerms"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Payment Terms</Label>
                                        <Input {...field} placeholder="e.g. Net 30" />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="placeOfSupply"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Place Of Supply</Label>
                                        <Input {...field} placeholder="State Code" />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="salesperson"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Salesperson</Label>
                                        <Input {...field} placeholder="Select Salesperson" />
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Item Table */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                                    <tr>
                                        <th className="py-2 px-4 text-left w-[40%]">Item Details</th>
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
                                                    <Select
                                                        value={form.watch(`items.${index}.itemId`)}
                                                        onValueChange={(val) => handleItemChange(index, val)}
                                                    >
                                                        <SelectTrigger className="border-0 shadow-none p-0 h-auto font-medium text-blue-600 hover:text-blue-800">
                                                            <SelectValue placeholder="Type or click to select an item." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {items.map(i => (
                                                                <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        {...form.register(`items.${index}.description`)}
                                                        className="border-0 shadow-none p-0 h-auto text-gray-500 placeholder:text-gray-300 focus-visible:ring-0"
                                                        placeholder="Item description"
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
                                                        form.setValue(`items.${index}.amount`, val * form.watch(`items.${index}.unitPrice`));
                                                    }}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        form.setValue(`items.${index}.unitPrice`, val);
                                                        form.setValue(`items.${index}.amount`, val * form.watch(`items.${index}.quantity`));
                                                    }}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.taxRate`, { valueAsNumber: true })}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top text-right font-medium text-gray-700">
                                                {new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(form.watch(`items.${index}.amount`) || 0)}
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
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 })}>
                                <Plus className="h-4 w-4 mr-2" /> Add New Row
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        {/* Bottom Left: Notes */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control as any}
                                name="customerNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Will be displayed on sales order" className="min-h-[100px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="termsAndConditions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Terms & Conditions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Enter the terms and conditions..." className="min-h-[100px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Bottom Right: Totals */}
                        <div className="bg-gray-50/50 p-6 rounded-lg space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Sub Total</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subTotal)}</span>
                            </div>

                            <FormField
                                control={form.control as any}
                                name="shippingCharges"
                                render={({ field }) => (
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">Shipping Charges</span>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="w-32 text-right h-8"
                                        />
                                    </div>
                                )}
                            />
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

                            <FormField
                                control={form.control as any}
                                name="adjustment"
                                render={({ field }) => (
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">Adjustment</span>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                className="w-32 text-right h-8"
                                            />
                                        </div>
                                    </div>
                                )}
                            />

                            <div className="flex justify-between text-lg font-bold border-t pt-4">
                                <span>Total ( ₹ )</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-start gap-4 pt-6 border-t sticky bottom-0 bg-white py-4 -mx-6 px-6 shadow-top">
                        <Button type="button" variant="outline" onClick={() => navigate('/sales/orders')}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSaveAndSend} className="bg-blue-600 hover:bg-blue-700 w-32" disabled={mutation.isPending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Save & Send
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && !isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isEditMode ? "Update Order" : "Save as Draft"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
