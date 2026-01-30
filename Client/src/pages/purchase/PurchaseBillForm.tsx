import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getParties, getItems } from '@/api/masters';
import { createBill, getPurchaseOrders, getGrns, type CreateBillDto } from '@/api/purchase';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

// Define Schema
const itemSchema = z.object({
    itemId: z.string().min(1, 'Item is required'),
    description: z.string(),
    quantity: z.number().min(0.01),
    rate: z.number().min(0),
    taxRate: z.number().min(0),
    amount: z.number(),
});

const formSchema = z.object({
    vendorId: z.string().min(1, 'Vendor is required'),
    vendorBillNumber: z.string().min(1, 'Vendor Bill No is required'),
    billDate: z.string(),
    dueDate: z.string(),
    purchaseOrderId: z.string().optional(),
    grnId: z.string().optional(),
    tdsCategory: z.string().optional(),
    tdsRate: z.number().min(0).default(0),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function PurchaseBillForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // External Data
    const { data: vendors = [] } = useQuery({ queryKey: ['parties', 'vendors'], queryFn: getParties, select: d => d.filter(p => p.type === 1) });
    const { data: items = [] } = useQuery({ queryKey: ['items'], queryFn: getItems });
    const { data: purchaseOrders = [] } = useQuery({ queryKey: ['purchaseOrders'], queryFn: getPurchaseOrders });
    const { data: grns = [] } = useQuery({ queryKey: ['grns'], queryFn: getGrns });

    // Setup Form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            tdsRate: 0,
            items: [{ itemId: '', description: '', quantity: 1, rate: 0, taxRate: 0, amount: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: 'items' });

    // Watchers
    const selectedVendorId = form.watch('vendorId');
    const selectedPoId = form.watch('purchaseOrderId');
    const selectedGrnId = form.watch('grnId');
    const watchedItems = form.watch('items');
    const tdsRate = form.watch('tdsRate') || 0;

    // Filtered Lists
    const filteredPos = purchaseOrders.filter(po => po.vendorId === selectedVendorId);
    const filteredGrns = grns.filter(g => g.vendorName === vendors.find(v => v.id === selectedVendorId)?.name); // Ideally filter by ID if available in GRN DTO

    // Auto-Populate from GRN (Priority)
    // Auto-Populate from GRN (Priority)
    useEffect(() => {
        if (selectedGrnId) {
            const grn = grns.find(g => g.id === selectedGrnId);
            if (grn) {
                // If GRN has PO link, set it
                if (grn.purchaseOrderId) form.setValue('purchaseOrderId', grn.purchaseOrderId);

                // Find Linked PO to get Prices
                const linkedPo = purchaseOrders.find(p => p.id === grn.purchaseOrderId);

                // Set Items from GRN
                const billItems = grn.items.map(gi => {
                    const masterItem = items.find(i => i.id === gi.itemId);
                    // Try to find price from PO, fallback to Master
                    let rate = masterItem?.purchasePrice || 0;

                    if (linkedPo) {
                        const poItem = linkedPo.items.find(pi => pi.itemId === gi.itemId);
                        if (poItem) {
                            rate = poItem.unitPrice;
                        }
                    }

                    return {
                        itemId: gi.itemId,
                        description: gi.description,
                        quantity: gi.quantity,
                        rate: rate,
                        taxRate: 0, // Could also pull tax from PO if needed
                        amount: (gi.quantity * rate)
                    };
                });
                replace(billItems);
            }
        }
    }, [selectedGrnId, grns, items, replace, form, purchaseOrders]);

    // Auto-Populate from PO (If no GRN)
    useEffect(() => {
        if (selectedPoId && !selectedGrnId) {
            const po = purchaseOrders.find(p => p.id === selectedPoId);
            if (po) {
                const billItems = po.items.map(pi => ({
                    itemId: pi.itemId,
                    description: pi.description,
                    quantity: pi.quantity - pi.receivedQuantity, // Remaining? Or full? Let's suggest full.
                    rate: pi.unitPrice,
                    taxRate: pi.taxRate,
                    amount: pi.totalAmount
                }));
                replace(billItems);
            }
        }
    }, [selectedPoId, selectedGrnId, purchaseOrders, replace]);

    // Calculations
    const subTotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxTotal = watchedItems.reduce((sum, item) => sum + ((item.quantity * item.rate) * (item.taxRate / 100)), 0);
    const totalAmount = subTotal + taxTotal;
    const tdsAmount = (totalAmount * tdsRate) / 100;
    const netPayable = totalAmount - tdsAmount;

    // Mutation
    const mutation = useMutation({
        mutationFn: createBill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            navigate('/purchase/bills');
        }
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate({
            ...data,
            billDate: new Date(data.billDate).toISOString(),
            dueDate: new Date(data.dueDate).toISOString(),
            purchaseOrderId: data.purchaseOrderId || undefined,
            grnId: data.grnId || undefined,
            tdsCategory: data.tdsCategory || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">New Purchase Bill</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Header Section */}
                        <div className="col-span-2 space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Bill Details</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control as any} name="vendorId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vendor</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control as any} name="vendorBillNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vendor Bill No</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control as any} name="billDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bill Date</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control as any} name="dueDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>

                            {/* Reference Section */}
                            <Card>
                                <CardHeader><CardTitle>References (3-Way Match)</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control as any} name="grnId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link GRN</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedVendorId}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select GRN" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {filteredGrns.map(g => <SelectItem key={g.id} value={g.id}>{g.grnNumber}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control as any} name="purchaseOrderId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link PO</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedVendorId}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {filteredPos.map(p => <SelectItem key={p.id} value={p.id}>{p.orderNumber}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* TDS Section */}
                        <div className="col-span-1">
                            <Card className="h-full">
                                <CardHeader><CardTitle>TDS & Payment</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control as any} name="tdsCategory" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TDS Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="194C">194C - Contractors</SelectItem>
                                                    <SelectItem value="194J">194J - Professional</SelectItem>
                                                    <SelectItem value="194I">194I - Rent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control as any} name="tdsRate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TDS Rate %</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex justify-between"><span>Sub Total:</span> <span>{subTotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Tax:</span> <span>{taxTotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between font-semibold"><span>Total:</span> <span>{totalAmount.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-red-600"><span>TDS (-):</span> <span>{tdsAmount.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-xl font-bold text-green-700 pt-2 border-t">
                                            <span>Net Payable:</span> <span>{netPayable.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Bill Items</CardTitle>
                            <Button type="button" onClick={() => append({ itemId: '', description: '', quantity: 1, rate: 0, taxRate: 0, amount: 0 })}>Add Item</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-3">
                                            <FormField control={form.control as any} name={`items.${index}.itemId`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Item</FormLabel>
                                                    <Select onValueChange={(val) => {
                                                        const item = items.find(i => i.id === val);
                                                        field.onChange(val);
                                                        if (item) {
                                                            form.setValue(`items.${index}.description`, item.name);
                                                            form.setValue(`items.${index}.rate`, item.purchasePrice || 0);
                                                        }
                                                    }} value={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger></FormControl>
                                                        <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField control={form.control as any} name={`items.${index}.description`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Description</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-1">
                                            <FormField control={form.control as any} name={`items.${index}.quantity`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-2">
                                            <FormField control={form.control as any} name={`items.${index}.rate`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Rate</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-1">
                                            <FormField control={form.control as any} name={`items.${index}.taxRate`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Tax %</FormLabel>
                                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-1 flex items-center justify-end pb-2">
                                            <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3-Way Match Real-time Verification */}
                    {(selectedPoId || selectedGrnId) && (
                        <Card className="bg-slate-50 border-blue-200">
                            <CardHeader><CardTitle className="text-blue-800 flex items-center gap-2"><CheckCircle className="h-5 w-5" /> 3-Way Match Verification</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-sm text-slate-600 mb-4">
                                    Verifying Bill Items against {selectedGrnId ? "GRN" : ""} {selectedPoId ? "and PO" : ""}...
                                </div>

                                {(() => {
                                    // 1. Calculate Variances
                                    let qtyMismatch = false;
                                    let rateMismatch = false;
                                    let extraItems = false;
                                    const variances: string[] = [];

                                    // Source for comparison
                                    const sourceItems = selectedGrnId
                                        ? grns.find(g => g.id === selectedGrnId)?.items
                                        : purchaseOrders.find(p => p.id === selectedPoId)?.items;

                                    if (!sourceItems) return null;

                                    watchedItems.forEach(item => {
                                        if (!item.itemId) return; // Skip empty rows

                                        // Find matching source item
                                        const sourceItem = sourceItems.find(si => si.itemId === item.itemId);

                                        if (!sourceItem) {
                                            extraItems = true;
                                            variances.push(`Item '${item.description}' is not in the source ${selectedGrnId ? 'GRN' : 'PO'}.`);
                                        } else {
                                            // Check Quantity
                                            // In GRN (sourceItem has quantity), In PO (sourceItem has quantity/receivedQuantity)
                                            // Usually we compare against 'Received Quantity' if GRN, or 'Ordered' if PO.
                                            // Assuming sourceItem structure matches standard item dto with quantity.
                                            let allowedQty = sourceItem.quantity;
                                            // If comparing against PO and no GRN, typically we compare against remaining? 
                                            // For now, strict check against source doc quantity.

                                            if (Number(item.quantity) > Number(allowedQty)) {
                                                qtyMismatch = true;
                                                variances.push(`Qty Mismatch: '${item.description}' (Bill: ${item.quantity}, Source: ${allowedQty})`);
                                            }

                                            // Check Price (PO Source Only or GRN->PO link)
                                            // We need to look up PO Rate.
                                            let allowedRate = 0;

                                            if (selectedPoId) {
                                                const poItem = purchaseOrders.find(p => p.id === selectedPoId)?.items.find(pi => pi.itemId === item.itemId);
                                                if (poItem) allowedRate = poItem.unitPrice;
                                            } else if (selectedGrnId) {
                                                const grn = grns.find(g => g.id === selectedGrnId);
                                                if (grn?.purchaseOrderId) {
                                                    const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId);
                                                    const poItem = po?.items.find(pi => pi.itemId === item.itemId);
                                                    if (poItem) allowedRate = poItem.unitPrice;
                                                }
                                            }

                                            // Only check rate if we found a source rate
                                            if (allowedRate > 0 && Number(item.rate) > Number(allowedRate)) {
                                                rateMismatch = true;
                                                variances.push(`Rate Mismatch: '${item.description}' (Bill: ${item.rate}, PO: ${allowedRate})`);
                                            }
                                        }
                                    });

                                    const isMatch = !qtyMismatch && !rateMismatch && !extraItems;

                                    return (
                                        <div className="space-y-3">
                                            <div className="flex gap-4">
                                                <div className={`flex items-center gap-2 border px-3 py-1 rounded ${!qtyMismatch && !extraItems ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'}`}>
                                                    {!qtyMismatch && !extraItems ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                                    Quantities {!qtyMismatch && !extraItems ? 'Match' : 'Mismatch'}
                                                </div>
                                                <div className={`flex items-center gap-2 border px-3 py-1 rounded ${!rateMismatch ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'}`}>
                                                    {!rateMismatch ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                                    Rates {!rateMismatch ? 'Match' : 'Mismatch'}
                                                </div>
                                            </div>

                                            {variances.length > 0 && (
                                                <div className="bg-red-50 p-3 rounded text-sm text-red-700 space-y-1">
                                                    <div className="font-semibold">Variances Found:</div>
                                                    <ul className="list-disc pl-5">
                                                        {variances.map((v, i) => <li key={i}>{v}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => navigate('/purchase/bills')}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Post Bill"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
