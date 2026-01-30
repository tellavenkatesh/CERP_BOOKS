import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, Trash, Plus } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { getParties, getItems } from '@/api/masters';
import { createRecurringInvoice, type CreateRecurringInvoiceDto } from '@/api/sales';

const formSchema = z.object({
    profileName: z.string().min(1, 'Profile name is required'),
    customerId: z.string().min(1, 'Customer is required'),
    recurringInterval: z.string().min(1, 'Interval is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    paymentTerms: z.string().optional(),
    items: z.array(
        z.object({
            itemId: z.string().min(1, 'Item is required'),
            description: z.string().min(1, 'Description is required'),
            quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
            rate: z.number().min(0, 'Rate must be 0 or greater'),
            taxRate: z.number().min(0, 'Tax rate must be 0 or greater'),
            amount: z.number(),
        })
    ).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function RecurringInvoiceForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: getParties,
        select: (data) => data.filter((p) => p.type === 0),
    });

    const { data: items = [] } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            profileName: '',
            customerId: '',
            recurringInterval: 'Monthly',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const createMutation = useMutation({
        mutationFn: createRecurringInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurring-invoices'] });
            navigate('/sales/recurring');
        },
    });

    const onSubmit = (values: FormValues) => {
        const dto: CreateRecurringInvoiceDto = {
            profileName: values.profileName,
            customerId: values.customerId,
            recurringInterval: values.recurringInterval,
            startDate: values.startDate,
            endDate: values.endDate || undefined,
            paymentTerms: values.paymentTerms,
            items: values.items.map((item) => ({
                itemId: item.itemId,
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                taxRate: item.taxRate,
            })),
        };
        createMutation.mutate(dto);
    };

    const handleItemSelect = (index: number, itemId: string) => {
        const item = items.find((i) => i.id === itemId);
        if (item) {
            form.setValue(`items.${index}.itemId`, itemId);
            form.setValue(`items.${index}.description`, item.description || item.name);
            form.setValue(`items.${index}.rate`, item.salesPrice);
            form.setValue(`items.${index}.taxRate`, 0); // Default to 0 as taxRate is not on Item
            calculateRowTotal(index);
        }
    };

    const calculateRowTotal = (index: number) => {
        const quantity = form.getValues(`items.${index}.quantity`) || 0;
        const rate = form.getValues(`items.${index}.rate`) || 0;
        const taxRate = form.getValues(`items.${index}.taxRate`) || 0;
        const taxAmount = (quantity * rate * taxRate) / 100;
        const amount = quantity * rate + taxAmount;
        form.setValue(`items.${index}.amount`, amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">New Recurring Invoice</h2>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="profileName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profile Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Monthly AMC" {...field} />
                                        </FormControl>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select customer" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id}>
                                                        {customer.name}
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
                                name="recurringInterval"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interval</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select interval" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Daily">Daily</SelectItem>
                                                <SelectItem value="Weekly">Weekly</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                <SelectItem value="Yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), 'PPP')
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) =>
                                                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                                                    }
                                                    disabled={(date) =>
                                                        date < new Date('1900-01-01')
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentTerms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Terms</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Net 30" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Item</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[100px]">Qty</TableHead>
                                        <TableHead className="w-[150px]">Rate</TableHead>
                                        <TableHead className="w-[100px]">Tax %</TableHead>
                                        <TableHead className="w-[150px]">Amount</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.itemId`}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => handleItemSelect(index, value)}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select item" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {items.map((item) => (
                                                                    <SelectItem key={item.id} value={item.id}>
                                                                        {item.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(parseFloat(e.target.value));
                                                                    calculateRowTotal(index);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.rate`}
                                                    render={({ field }) => (
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(parseFloat(e.target.value));
                                                                    calculateRowTotal(index);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.taxRate`}
                                                    render={({ field }) => (
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(parseFloat(e.target.value));
                                                                    calculateRowTotal(index);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.amount`}
                                                    render={({ field }) => (
                                                        <div className="py-2.5">
                                                            ₹{field.value?.toFixed(2)}
                                                        </div>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() =>
                                    append({
                                        itemId: '',
                                        description: '',
                                        quantity: 1,
                                        rate: 0,
                                        taxRate: 0,
                                        amount: 0,
                                    })
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/sales/recurring')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Creating...' : 'Create Recurring Profile'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}


