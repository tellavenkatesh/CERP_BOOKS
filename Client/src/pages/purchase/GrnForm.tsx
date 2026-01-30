import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getParties, getItems } from '@/api/masters';
import { createGrn, getPurchaseOrders } from '@/api/purchase';
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
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { format } from 'date-fns';

const itemSchema = z.object({
    itemId: z.string().min(1, 'Item is required'),
    description: z.string(),
    quantity: z.number().min(1),
});

const formSchema = z.object({
    vendorId: z.string().min(1, 'Vendor is required'),
    purchaseOrderId: z.string().optional(),
    grnDate: z.string(),
    vendorInvoiceNumber: z.string().min(1, 'Vendor Invoice/Challan No is required'),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function GrnForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: vendors = [] } = useQuery({
        queryKey: ['parties', 'vendors'],
        queryFn: getParties,
        select: (data) => data.filter(p => p.type === 1),
    });

    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    // Fetch POs
    const { data: purchaseOrders = [] } = useQuery({
        queryKey: ['purchaseOrders'],
        queryFn: getPurchaseOrders,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grnDate: new Date().toISOString().split('T')[0],
            items: [{ itemId: '', description: '', quantity: 1 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const [searchParams] = useSearchParams();
    const poIdParam = searchParams.get('poId');

    const selectedVendorId = form.watch('vendorId');
    const selectedPoId = form.watch('purchaseOrderId');

    // Auto-select Vendor and PO if poId is passed
    useEffect(() => {
        if (poIdParam && purchaseOrders.length > 0 && !selectedPoId) {
            const po = purchaseOrders.find(p => p.id === poIdParam);
            if (po) {
                form.setValue('vendorId', po.vendorId);
                // Allow state update to propagate
                setTimeout(() => form.setValue('purchaseOrderId', po.id), 0);
            }
        }
    }, [poIdParam, purchaseOrders, form, selectedPoId]);

    // Filter POs by selected Vendor
    const filteredPos = purchaseOrders.filter(po => po.vendorId === selectedVendorId && po.status !== 'Closed' && po.status !== 'Cancelled');

    // Auto-fill items when PO is selected
    useEffect(() => {
        if (selectedPoId) {
            const po = purchaseOrders.find(p => p.id === selectedPoId);
            if (po) {
                const newItems = po.items.map(i => ({
                    itemId: i.itemId,
                    description: i.description,
                    quantity: i.quantity - i.receivedQuantity > 0 ? i.quantity - i.receivedQuantity : 0, // Suggest remaining quantity
                }));
                replace(newItems);
            }
        }
    }, [selectedPoId, purchaseOrders, replace]);

    const mutation = useMutation({
        mutationFn: createGrn,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['grns'] });
            navigate('/purchase/grns');
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate({
            ...values,
            grnDate: new Date(values.grnDate).toISOString(),
            purchaseOrderId: values.purchaseOrderId || undefined,
            items: values.items.map(i => ({
                itemId: i.itemId,
                description: i.description,
                quantity: i.quantity
            }))
        });
    }

    const handleItemChange = (index: number, itemId: string) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            form.setValue(`items.${index}.itemId`, itemId);
            form.setValue(`items.${index}.description`, item.name);
            form.setValue(`items.${index}.quantity`, 1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Create GRN</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="vendorId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor</FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); form.setValue('purchaseOrderId', ''); }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select vendor" />
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
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="purchaseOrderId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link Purchase Order (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedVendorId}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select PO" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredPos.map(po => (
                                                    <SelectItem key={po.id} value={po.id}>{po.orderNumber} ({format(new Date(po.orderDate), 'dd/MM/yyyy')})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="grnDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GRN Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vendorInvoiceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor Invoice / Challan No</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Items Received</h3>
                                <Button type="button" variant="outline" onClick={() => append({ itemId: '', description: '', quantity: 1 })}>
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-4">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.itemId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Item</FormLabel>
                                                        <Select
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                handleItemChange(index, val);
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Item" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {items.map(i => (
                                                                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Description</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Received Qty</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/purchase/grns')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Create GRN"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
