import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getParties, getItems, getAccounts, getTaxCodes } from '@/api/masters';
import { createPurchaseOrder, updatePurchaseOrder, getPurchaseRequests, getPurchaseOrders, sendPurchaseOrder, type CreatePurchaseOrderDto } from '@/api/purchase';
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
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const itemSchema = z.object({
    itemId: z.string().min(1, 'Item is required'),
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    accountId: z.string().optional(),
    taxId: z.string().optional(),
    taxRate: z.number().min(0),
    amount: z.number(),
});

const formSchema = z.object({
    vendorId: z.string().min(1, 'Vendor is required'),
    orderDate: z.string(),
    expectedDeliveryDate: z.string().optional(),
    deliveryAddress: z.string().optional(),
    reference: z.string().optional(),
    paymentTerms: z.string().optional(),
    shipmentPreference: z.string().optional(),
    notes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    adjustment: z.number().optional(),
    discountAmount: z.number().optional(),
    discountPercentage: z.number().optional(),
    purchaseRequestId: z.string().optional(),
    orderType: z.string().default('Standard'),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PurchaseOrderForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const prId = searchParams.get('prId');
    const editId = searchParams.get('editId');
    const isEditMode = !!editId;

    const { data: parties = [] } = useQuery({
        queryKey: ['parties'],
        queryFn: getParties,
    });

    const vendors = parties.filter(p => p.type === 1);
    const customers = parties.filter(p => p.type === 0);

    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const { data: accounts = [] } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const { data: taxCodes = [] } = useQuery({
        queryKey: ['taxCodes'],
        queryFn: getTaxCodes,
    });

    // Fetch PO if editing
    const { data: existingPo, isLoading: isPoLoading } = useQuery({
        queryKey: ['purchaseOrder', editId],
        queryFn: () => getPurchaseOrders().then(pos => pos.find(p => p.id === editId)),
        enabled: isEditMode
    });

    // Fetch Purchase Requests (Always enabled to allow linking)
    const { data: prs = [] } = useQuery({
        queryKey: ['purchaserequests'],
        queryFn: getPurchaseRequests
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            vendorId: '',
            purchaseRequestId: '',
            orderDate: new Date().toISOString().split('T')[0],
            orderType: 'Standard',
            items: [{ itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0, accountId: '', taxId: '' }],
            discountAmount: 0,
            adjustment: 0,
            discountPercentage: 0,
            deliveryAddress: 'Organization Address\nTelangana, India.'
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const formItems = useWatch({ control: form.control, name: 'items' });
    const adjustment = useWatch({ control: form.control, name: 'adjustment' }) || 0;
    const discountAmount = useWatch({ control: form.control, name: 'discountAmount' }) || 0;
    const watchedVendorId = useWatch({ control: form.control, name: 'vendorId' });
    const watchedPrId = useWatch({ control: form.control, name: 'purchaseRequestId' });

    // Vendor Address State
    const [vendorBillingAddress, setVendorBillingAddress] = useState<string>('');
    const [vendorShippingAddress, setVendorShippingAddress] = useState<string>('');

    // Delivery State
    const [deliveryType, setDeliveryType] = useState<'Organization' | 'Customer'>('Organization');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [deliverToAddress, setDeliverToAddress] = useState<string>('Organization Address\nTelangana, India.');

    const updateVendorAddresses = (vendorId: string) => {
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor) {
            const billAddr = [
                vendor.billingAttention,
                vendor.billingAddress,
                vendor.billingCity,
                vendor.billingState,
                vendor.billingPincode,
                vendor.billingCountry,
                vendor.billingPhone ? `Phone: ${vendor.billingPhone}` : ''
            ].filter(p => p && p.trim()).join('\n');
            setVendorBillingAddress(billAddr);

            const shipAddr = [
                vendor.shippingAttention,
                vendor.shippingAddress,
                vendor.shippingCity,
                vendor.shippingState,
                vendor.shippingPincode,
                vendor.shippingCountry,
                vendor.shippingPhone ? `Phone: ${vendor.shippingPhone}` : ''
            ].filter(p => p && p.trim()).join('\n');
            setVendorShippingAddress(shipAddr);
            return vendor;
        }
        return null;
    };

    const handleVendorChange = (vendorId: string) => {
        form.setValue('vendorId', vendorId);
        const vendor = updateVendorAddresses(vendorId);
        if (vendor) {
            form.setValue('paymentTerms', vendor.paymentTermId?.toString() || '');
        }
    };

    const handleDeliveryTypeChange = (type: 'Organization' | 'Customer') => {
        setDeliveryType(type);
        if (type === 'Organization') {
            const orgAddr = 'Organization Address\nTelangana, India.';
            setDeliverToAddress(orgAddr);
            form.setValue('deliveryAddress', orgAddr);
            setSelectedCustomerId('');
        } else {
            setDeliverToAddress('');
            form.setValue('deliveryAddress', '');
        }
    };

    const handleCustomerChange = (customerId: string) => {
        setSelectedCustomerId(customerId);
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            const shipAddr = [
                customer.shippingAttention,
                customer.shippingAddress,
                customer.shippingCity,
                customer.shippingState,
                customer.shippingPincode,
                customer.shippingCountry,
                customer.shippingPhone ? `Phone: ${customer.shippingPhone}` : ''
            ].filter(p => p && p.trim()).join('\n');

            setDeliverToAddress(shipAddr);
            form.setValue('deliveryAddress', shipAddr);
        }
    };

    // Update addresses when vendors list loads or vendorId changes (for initial load)
    useEffect(() => {
        if (watchedVendorId && vendors.length > 0) {
            updateVendorAddresses(watchedVendorId);
        }
    }, [watchedVendorId, vendors]);

    // Populate from Edit PO
    useEffect(() => {
        if (existingPo) {
            form.reset({
                vendorId: existingPo.vendorId,
                purchaseRequestId: existingPo.purchaseRequestId || '',
                orderDate: new Date(existingPo.orderDate).toISOString().split('T')[0],
                expectedDeliveryDate: existingPo.expectedDeliveryDate ? new Date(existingPo.expectedDeliveryDate).toISOString().split('T')[0] : undefined,
                deliveryAddress: existingPo.deliveryAddress || '',
                reference: existingPo.reference || '',
                paymentTerms: existingPo.paymentTerms || '',
                shipmentPreference: existingPo.shipmentPreference || '',
                notes: existingPo.notes || '',
                termsAndConditions: existingPo.termsAndConditions || '',
                adjustment: existingPo.adjustment || 0,
                discountAmount: existingPo.discountAmount || 0,
                discountPercentage: existingPo.discountPercentage || 0,
                orderType: existingPo.orderType || 'Standard',
                items: existingPo.items.map(i => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    taxRate: i.taxRate,
                    amount: i.totalAmount,
                    accountId: i.accountId || '',
                    taxId: i.taxId || ''
                }))
            });

            // Detect Delivery Type
            if (existingPo.deliveryAddress && !existingPo.deliveryAddress.includes('Organization Address')) {
                setDeliveryType('Customer');
                setDeliverToAddress(existingPo.deliveryAddress);
            } else {
                setDeliveryType('Organization');
                setDeliverToAddress('Organization Address\nTelangana, India.');
            }
        }
    }, [existingPo, form]);

    // Populate from PR URL Param
    useEffect(() => {
        if (prId && prs.length > 0) {
            // Only set if not already set or confirmed (simple check)
            if (!watchedPrId) {
                applyPrData(prId);
            }
        }
    }, [prId, prs]); // removed dependencies to avoid loops, simplified

    const applyPrData = (id: string) => {
        const pr = prs.find(p => p.id === id);
        if (pr) {
            form.setValue('purchaseRequestId', id);

            const poItems = pr.items.map(item => ({
                itemId: item.itemId,
                description: item.description || item.itemName,
                quantity: item.quantity,
                unitPrice: item.estimatedRate,
                taxRate: 0,
                amount: item.estimatedAmount,
                accountId: '',
                taxId: ''
            }));

            if (poItems.length > 0) replace(poItems);
            if (pr.reason) form.setValue('notes', `PR Reason: ${pr.reason}`);
        }
    };

    const handlePRChange = (id: string) => {
        applyPrData(id);
    };

    // Add state to track which button invited the submit
    const [isSaveAndSend, setIsSaveAndSend] = useState(false);

    const mutation = useMutation({
        mutationFn: async ({ values, shouldSend }: { values: CreatePurchaseOrderDto, shouldSend: boolean }) => {
            let id = '';
            // 1. Create or Update
            if (isEditMode) {
                id = await updatePurchaseOrder(editId!, values);
                // The update API returns the ID (string)
                if (!id) id = editId!;
            } else {
                id = await createPurchaseOrder(values);
            }

            // 2. Send if requested
            if (shouldSend && id) {
                // Logic handled in backend now (via shouldSend flag if API supported it, but here we likely rely on separate call or flags)
                // The backend handler for create/update doesn't seem to send email automatically? 
                // Wait, the previous fix added email sending to 'SendPurchaseOrderCommand'. 
                // We need to call that command here if shouldSend is true.
                if (shouldSend) {
                    await sendPurchaseOrder(id);
                }
            }
            return { id, shouldSend };
        },
        onSuccess: ({ shouldSend }) => {
            void queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
            const action = isEditMode ? 'Updated' : 'Created';
            const sentMsg = shouldSend ? ' & Sent' : '';
            toast.success(`Purchase Order ${action}${sentMsg}`);
            navigate('/purchase/orders');
        },
        onError: () => toast.error("Failed to save Purchase Order")
    });

    function onSubmit(values: FormValues, shouldSendOrEvent: any = false) {
        const shouldSend = typeof shouldSendOrEvent === 'boolean' ? shouldSendOrEvent : false;
        const orderTypeMap: Record<string, number> = { 'Standard': 0, 'Service': 1, 'Blanket': 2 };

        const dto: CreatePurchaseOrderDto = {
            ...values,
            orderDate: new Date(values.orderDate).toISOString(),
            expectedDeliveryDate: values.expectedDeliveryDate ? new Date(values.expectedDeliveryDate).toISOString() : undefined,
            orderType: orderTypeMap[values.orderType] ?? 0,
            items: values.items.map(i => ({
                itemId: i.itemId,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                taxRate: i.taxRate,
                accountId: i.accountId || undefined,
                taxId: i.taxId || undefined
            })),
            purchaseRequestId: values.purchaseRequestId || undefined,
            deliveryAddress: values.deliveryAddress || deliverToAddress
        };

        mutation.mutate({ values: dto, shouldSend });
    }

    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            form.setValue(`items.${index}.itemId`, itemId);
            form.setValue(`items.${index}.description`, item.name);
            form.setValue(`items.${index}.unitPrice`, item.purchasePrice || 0);
            form.setValue(`items.${index}.quantity`, 1);

            // Set Tax
            const taxCode = taxCodes.find(t => t.id === item.taxCodeId);
            form.setValue(`items.${index}.taxId`, item.taxCodeId || '');
            form.setValue(`items.${index}.taxRate`, taxCode?.rate || 0);

            // Set Account
            form.setValue(`items.${index}.accountId`, item.purchaseLedgerId || '');

            form.setValue(`items.${index}.amount`, item.purchasePrice || 0);
        }
    };

    const handleTaxChange = (index: number, taxId: string) => {
        const taxCode = taxCodes.find(t => t.id === taxId);
        form.setValue(`items.${index}.taxId`, taxId);
        form.setValue(`items.${index}.taxRate`, taxCode?.rate || 0);
    };

    const subTotal = formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = formItems.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * (item.taxRate / 100)), 0);
    const total = subTotal + taxTotal + adjustment - discountAmount;

    if (isEditMode && isPoLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">

                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column - Vendor & Delivery */}
                        <div className="space-y-8">
                            {/* Vendor Selection */}
                            <FormField
                                control={form.control}
                                name="vendorId"
                                render={({ field }) => (
                                    <div className="space-y-4">
                                        <FormItem>
                                            <FormLabel className="text-red-500">Vendor Name*</FormLabel>
                                            <Select onValueChange={handleVendorChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Vendor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {vendors.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>

                                        {/* Vendor Addresses Display */}
                                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md">
                                            <div>
                                                <p className="font-bold text-gray-500 text-xs mb-1 uppercase">Billing Address</p>
                                                <div className="text-gray-700 whitespace-pre-wrap min-h-[40px]">
                                                    {vendorBillingAddress || <span className="text-gray-400 italic">--</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-500 text-xs mb-1 uppercase">Shipping Address</p>
                                                <div className="text-gray-700 whitespace-pre-wrap min-h-[40px]">
                                                    {vendorShippingAddress || <span className="text-gray-400 italic">--</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Delivery Address Section */}
                            <div className="space-y-3">
                                <Label className="text-red-500 font-semibold text-sm">Delivery Address*</Label>
                                <RadioGroup
                                    value={deliveryType}
                                    onValueChange={(val: 'Organization' | 'Customer') => handleDeliveryTypeChange(val)}
                                    className="flex space-x-4 mb-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Organization" id="r-org" />
                                        <Label htmlFor="r-org">Organization</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Customer" id="r-cust" />
                                        <Label htmlFor="r-cust">Customer</Label>
                                    </div>
                                </RadioGroup>

                                <div className="pl-1">
                                    {deliveryType === 'Customer' && (
                                        <div className="mb-3 w-3/4">
                                            <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Display Delivery Address */}
                                    {deliverToAddress ? (
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-500 uppercase">Shipping Address</p>
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap border-l-2 border-blue-500 pl-3 py-1">
                                                {deliverToAddress}
                                            </div>
                                            {/* Hidden input binding */}
                                            <FormField
                                                control={form.control}
                                                name="deliveryAddress"
                                                render={({ field }) => (
                                                    <Input {...field} className="hidden" />
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">Select a {deliveryType} to view address</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Dates & Meta */}
                        <div className="space-y-4">

                            {/* PR Link Field */}
                            <FormField
                                control={form.control}
                                name="purchaseRequestId"
                                render={({ field }) => (
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="text-gray-600">Link PR</Label>
                                        <div className="col-span-2">
                                            <Select value={field.value} onValueChange={handlePRChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Purchase Request" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {prs.map(pr => (
                                                        <SelectItem key={pr.id} value={pr.id}>
                                                            {pr.requestNumber} {pr.department ? `- ${pr.department}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="text-gray-600">Reference#</Label>
                                        <div className="col-span-2">
                                            <Input {...field} />
                                        </div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="orderDate"
                                render={({ field }) => (
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="text-gray-600">Date*</Label>
                                        <div className="col-span-2">
                                            <Input type="date" {...field} />
                                        </div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expectedDeliveryDate"
                                render={({ field }) => (
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="text-gray-600">Expected Delivery</Label>
                                        <div className="col-span-2">
                                            <Input type="date" {...field} />
                                        </div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentTerms"
                                render={({ field }) => (
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="text-gray-600">Payment Terms</Label>
                                        <div className="col-span-2">
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Due on Receipt" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                                    <SelectItem value="Net 15">Net 15</SelectItem>
                                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                                    <SelectItem value="Net 45">Net 45</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shipmentPreference"
                                render={({ field }) => (
                                    <div className="grid grid-cols-3 gap-4 items-center">
                                        <Label className="text-gray-600">Shipment Preference</Label>
                                        <div className="col-span-2">
                                            <Input {...field} placeholder="Choose shipment preference" />
                                        </div>
                                    </div>
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
                                        <th className="py-2 px-4 text-left w-[30%]">Item Details</th>
                                        <th className="py-2 px-4 text-left w-[15%]">Account</th>
                                        <th className="py-2 px-4 text-right w-[10%]">Quantity</th>
                                        <th className="py-2 px-4 text-right w-[10%]">Rate</th>
                                        <th className="py-2 px-4 text-left w-[15%]">Tax</th>
                                        <th className="py-2 px-4 text-right w-[15%]">Amount</th>
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
                                                <Select
                                                    value={form.watch(`items.${index}.accountId`)}
                                                    onValueChange={(val) => form.setValue(`items.${index}.accountId`, val)}
                                                >
                                                    <SelectTrigger className="border-0 shadow-none p-0 h-auto">
                                                        <SelectValue placeholder="Select Account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map(acc => (
                                                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Input
                                                    type="number"
                                                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                                    className="text-right"
                                                />
                                            </td>
                                            <td className="p-2 align-top">
                                                <Select
                                                    value={form.watch(`items.${index}.taxId`)}
                                                    onValueChange={(val) => handleTaxChange(index, val)}
                                                >
                                                    <SelectTrigger className="border-0 shadow-none p-0 h-auto">
                                                        <SelectValue placeholder="Select Tax" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {taxCodes.map(tax => (
                                                            <SelectItem key={tax.id} value={tax.id}>
                                                                {tax.name} ({tax.rate}%)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2 align-top text-right font-medium text-gray-700">
                                                {new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format((form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.unitPrice`) || 0))}
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
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0, accountId: '', taxId: '' })}>
                            <Plus className="h-4 w-4 mr-2" /> Add New Row
                        </Button>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Will be displayed on purchase order" className="min-h-[100px]" />
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
                                            <Textarea {...field} placeholder="Enter the terms and conditions..." className="min-h-[100px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-lg space-y-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Sub Total</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subTotal)}</span>
                            </div>

                            <FormField
                                control={form.control}
                                name="discountAmount"
                                render={({ field }) => (
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">Discount</span>
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

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(taxTotal)}</span>
                            </div>

                            <FormField
                                control={form.control}
                                name="adjustment"
                                render={({ field }) => (
                                    <div className="flex justify-between items-center text-sm gap-4">
                                        <span className="text-gray-600">Adjustment</span>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="w-32 text-right h-8"
                                        />
                                    </div>
                                )}
                            />

                            <div className="flex justify-between text-lg font-bold border-t pt-4">
                                <span>Total ( ₹ )</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start gap-4 pt-6 border-t font-medium">
                        <Button type="button" variant="outline" onClick={() => navigate('/purchase/orders')}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={() => {
                                setIsSaveAndSend(false);
                                form.handleSubmit((d) => onSubmit(d, false))();
                            }}
                        >
                            {mutation.isPending && !isSaveAndSend && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Update" : "Save as Draft"}
                        </Button>
                        <Button
                            type="button"
                            disabled={mutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                                setIsSaveAndSend(true);
                                form.handleSubmit((d) => onSubmit(d, true))();
                            }}
                        >
                            {mutation.isPending && isSaveAndSend && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save and Send
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
