import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, createItem, getTaxCodes, type Item, type CreateItemDto } from '@/api/masters';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Name is required.' }),
    code: z.string().min(1, { message: 'Code is required.' }),
    type: z.string(),
    unit: z.string().default('Nos'),
    category: z.string().optional(),
    description: z.string().optional(),
    salesPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Invalid price' }),
    purchasePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Invalid price' }).default('0'),
    hsnCode: z.string().optional(),
    taxCodeId: z.string().optional(),
    trackInventory: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function ItemsPage() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const { data: taxCodes = [] } = useQuery({
        queryKey: ['taxCodes'],
        queryFn: getTaxCodes,
    });

    const mutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['items'] });
            setOpen(false);
            form.reset();
            toast.success("Item created successfully");
        },
    });

    const form = useForm<any>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            type: '0', // Product
            unit: 'Nos',
            category: '',
            description: '',
            salesPrice: '0',
            purchasePrice: '0',
            hsnCode: '',
            trackInventory: true,
        },
    });

    function onSubmit(values: any) {
        const dto: CreateItemDto = {
            name: values.name,
            code: values.code,
            type: parseInt(values.type),
            baseUom: values.unit,
            category: values.category,
            description: values.description || '',
            salesPrice: parseFloat(values.salesPrice),
            purchasePrice: parseFloat(values.purchasePrice),
            hsnSacCode: values.hsnCode,
            taxCodeId: values.taxCodeId === 'none' ? undefined : values.taxCodeId,
            trackInventory: values.trackInventory,

            // Default values for required fields not in form
            openingQuantity: 0,
            openingRate: 0,
            reorderLevel: 0,
            discountPercentage: 0,
            taxInclusive: false,
            taxRate: 0,
            batchTracking: false,
            serialTracking: false,
            expiryTracking: false
        };
        mutation.mutate(dto);
    }

    const columns: ColumnDef<Item>[] = [
        {
            accessorKey: 'name',
            header: 'Item Name',
        },
        {
            accessorKey: 'code',
            header: 'Code',
        },
        {
            accessorKey: 'category',
            header: 'Category',
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (row.original as any).type === 0 ? 'Product' : 'Service',
        },
        {
            accessorKey: 'salesPrice',
            header: 'Sales Price',
            cell: ({ row }) => row.original.salesPrice.toFixed(2),
        },
        {
            accessorKey: 'currentStock',
            header: 'Stock',
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Item Master</h2>
                    <p className="text-muted-foreground">Manage products, services, and inventory.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Item</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Item</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Widget A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Code / SKU</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="WID-001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="0">Product</SelectItem>
                                                        <SelectItem value="1">Service</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Electronics, Services, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit (UOM)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nos, Kgs, Ltrs" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hsnCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HSN / SAC Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123456" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="salesPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sales Price (Selling Rate)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="purchasePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Purchase Price (Cost)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="taxCodeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Default Tax Rate</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Tax" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {taxCodes.map(tc => (
                                                            <SelectItem key={tc.id} value={tc.id}>
                                                                {tc.name} ({tc.rate}%)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="trackInventory"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Track Inventory</FormLabel>
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
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detailed product description..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={mutation.isPending} className="w-full">
                                    {mutation.isPending ? "Saving..." : "Save Item"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={items} searchKey="name" />
            )}
        </div>
    );
}
