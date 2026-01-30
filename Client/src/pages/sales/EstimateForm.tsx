import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { getParties, getItems } from '@/api/masters';
import { createEstimate, sendEstimate, getEstimateById, updateEstimate } from '@/api/sales';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Trash2, Plus, GripVertical, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const itemSchema = z.object({
    itemId: z.string().min(1, 'Item is required'),
    description: z.string(),
    quantity: z.number().min(1),
    rate: z.number().min(0),
    taxRate: z.number().min(0),
    amount: z.number(),
});

const formSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    estimateDate: z.string(),
    expiryDate: z.string(),
    referenceNumber: z.string().optional(),
    placeOfSupply: z.string().optional(),
    salesperson: z.string().optional(),
    projectName: z.string().optional(),
    customerNotes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    shippingCharges: z.number().optional(),
    adjustment: z.number().optional(),
    taxAmount: z.number().optional(),
    negotiationAllowed: z.boolean().default(false),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EstimateForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const queryClient = useQueryClient();

    const { data: estimateData, isLoading: isLoadingEstimate } = useQuery({
        queryKey: ['estimate', id],
        queryFn: () => getEstimateById(id!),
        enabled: isEditMode,
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['parties', 'customers'],
        queryFn: getParties,
        select: (data) => data.filter(p => p.type === 0),
    });

    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            estimateDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            customerNotes: '',
            termsAndConditions: '',
            referenceNumber: '',
            placeOfSupply: '',
            salesperson: '',
            projectName: '',
            shippingCharges: 0,
            adjustment: 0,
            taxAmount: 0,
            negotiationAllowed: false,
            items: [{ itemId: '', description: '', quantity: 1, rate: 0, taxRate: 0, amount: 0 }],
        },
    });

    useEffect(() => {
        if (estimateData) {
            form.reset({
                customerId: estimateData.customerId,
                estimateDate: estimateData.estimateDate.split('T')[0],
                expiryDate: estimateData.expiryDate.split('T')[0],
                referenceNumber: estimateData.referenceNumber || '',
                placeOfSupply: estimateData.placeOfSupply || '',
                salesperson: estimateData.salesperson || '',
                projectName: estimateData.projectName || '',
                customerNotes: estimateData.customerNotes || '',
                termsAndConditions: estimateData.termsAndConditions || '',
                shippingCharges: estimateData.shippingCharges || 0,
                adjustment: estimateData.adjustment || 0,
                taxAmount: estimateData.taxAmount || 0,
                negotiationAllowed: estimateData.negotiationAllowed || false,
                items: estimateData.items.map(i => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity,
                    rate: i.rate,
                    taxRate: i.taxRate,
                    amount: (i.quantity * i.rate) // or calculate
                }))
            });
        }
    }, [estimateData, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const selectedCustomerId = useWatch({ control: form.control, name: 'customerId' });
    const formItems = useWatch({ control: form.control, name: 'items' });
    const shippingCharges = useWatch({ control: form.control, name: 'shippingCharges' }) || 0;
    const adjustment = useWatch({ control: form.control, name: 'adjustment' }) || 0;
    const taxAmount = useWatch({ control: form.control, name: 'taxAmount' }) || 0;

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [billingAddress, setBillingAddress] = useState<string>('');
    const [shippingAddress, setShippingAddress] = useState<string>('');

    // Update selected customer state for address display
    useEffect(() => {
        if (selectedCustomerId) {
            const customer = customers.find(c => c.id === selectedCustomerId);
            setSelectedCustomer(customer || null);
            if (customer) {
                form.setValue('placeOfSupply', customer.billingState || '');
            }
        } else {
            setSelectedCustomer(null);
        }
    }, [selectedCustomerId, customers, form]);

    // Update Tax Amount when Items Change
    useEffect(() => {
        // Calculate tax from items
        const calculatedTax = formItems.reduce((sum, item) => sum + ((item.quantity * item.rate) * (item.taxRate / 100)), 0);

        // Use a small epsilon for float comparison or just direct
        // Only update if significantly different to avoid loop if we wanted to support manual override persistence
        // BUT current requirement: "Tax field is not editable".
        // Interpretation: Make it editable. 
        // Logic: If user changes items, system recalculates. If user types in Tax, it stays until next item change.
        // This is achieved by simply setting the value here. 
        // Note: useWatch triggers this effect. infinite loop if we setValue?
        // formItems is watched. setValue 'taxAmount' does NOT change formItems. So no loop.
        form.setValue('taxAmount', calculatedTax);
    }, [formItems, form]);
    // Wait, if I include formItems in dependency, it runs when items change. Correct.

    // Calculations
    const subTotal = formItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    // const taxTotal = formItems.reduce((sum, item) => sum + ((item.quantity * item.rate) * (item.taxRate / 100)), 0);
    const total = subTotal + taxAmount + shippingCharges + adjustment;


    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (values: FormValues, shouldSend: boolean) => {
        try {
            setIsSaving(true);
            const data = {
                ...values,
                estimateDate: new Date(values.estimateDate).toISOString(),
                expiryDate: new Date(values.expiryDate).toISOString(),
                shippingCharges: values.shippingCharges || 0,
                adjustment: values.adjustment || 0,
                taxAmount: values.taxAmount,
                negotiationAllowed: values.negotiationAllowed,
                items: values.items.map(i => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity,
                    rate: i.rate,
                    taxRate: i.taxRate
                }))
            };

            let estimateId = id;
            if (isEditMode && id) {
                await updateEstimate(id, data);
            } else {
                estimateId = await createEstimate(data);
            }

            if (shouldSend) {
                await sendEstimate(estimateId!);
                toast.success(isEditMode ? "Estimate updated and sent successfully!" : "Estimate created and sent successfully!");
            } else {
                toast.success(isEditMode ? "Estimate updated successfully!" : "Estimate created successfully!");
            }

            void queryClient.invalidateQueries({ queryKey: ['estimates'] });
            navigate('/sales/estimates');
        } catch (error) {
            console.error(error);
            toast.error("Failed to save estimate");
        } finally {
            setIsSaving(false);
        }
    };

    const onSaveDraft = form.handleSubmit((values: any) => handleSave(values, false));
    const onSaveAndSend = form.handleSubmit((values: any) => handleSave(values, true));

    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            form.setValue(`items.${index}.itemId`, itemId);
            form.setValue(`items.${index}.description`, item.name); // Or description if available
            form.setValue(`items.${index}.rate`, item.salesPrice);
            form.setValue(`items.${index}.quantity`, 1);
            form.setValue(`items.${index}.taxRate`, 0); // Default, maybe fetch from item tax code
            form.setValue(`items.${index}.amount`, item.salesPrice);
        }
    };

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            form.setValue('customerId', customerId);

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
            const formattedBillingAddress = billingAddressParts.join('\n');
            setBillingAddress(formattedBillingAddress);

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
            const formattedShippingAddress = shippingAddressParts.join('\n');
            setShippingAddress(formattedShippingAddress);

            form.setValue('placeOfSupply', customer.billingState || ''); // Default POS to billing state
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Estimate' : 'New Estimate'}</h2>
            </div>

            {estimateData?.status === 'NegotiationRequested' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Customer has requested changes to this estimate.</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate(`/sales/estimates/${id}/compare`)}
                    >
                        Review Negotiation
                    </Button>
                </div>
            )}

            <Form {...form}>
                <form className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">

                    {/* Top Section: Customer & basic info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Customer & Address */}
                        <div className="space-y-6">
                            <FormField
                                control={form.control as any}
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

                        {/* Right Column: Key Details */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label className="text-gray-600">Estimate#*</Label>
                                <Input placeholder="EST-XXXX" className="bg-white" />
                            </div>
                            <FormField
                                control={form.control as any}
                                name="referenceNumber"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Reference#</Label>
                                        <Input {...field} />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="estimateDate"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Estimate Date*</Label>
                                        <Input type="date" {...field} />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="expiryDate"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4 items-center">
                                        <Label className="text-gray-600">Expiry Date</Label>
                                        <Input type="date" {...field} />
                                    </div>
                                )}
                            />
                            {/* Negotiation Toggle */}
                            <FormField
                                control={form.control as any}
                                name="negotiationAllowed"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-blue-50/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-gray-900 font-semibold">Allow Negotiation</FormLabel>
                                            <p className="text-xs text-gray-500">Allow customer to propose changes?</p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {/* Place of Supply */}
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
                            {/* Salesperson Placeholder */}
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
                                                        form.setValue(`items.${index}.amount`, val * form.watch(`items.${index}.rate`));
                                                    }}
                                                    className="text-right"
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
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: '', description: '', quantity: 1, rate: 0, taxRate: 0, amount: 0 })}>
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
                                            <Textarea {...field} placeholder="Will be displayed on the estimate" className="min-h-[100px]" />
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
                            <FormField
                                control={form.control as any}
                                name="taxAmount"
                                render={({ field }) => (
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">Tax</span>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="w-32 text-right h-8"
                                        />
                                    </div>
                                )}
                            />

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
                        <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSaving}>
                            Save as Draft
                        </Button>
                        <Button type="button" onClick={onSaveAndSend} className="bg-blue-600 hover:bg-blue-700 w-32" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save and Send"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => navigate('/sales/estimates')}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
