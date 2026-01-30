import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getParties, createParty, type Party, type CreatePartyDto } from '@/api/masters';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { toast } from 'sonner';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Name is required.' }),
    displayName: z.string().optional(),
    type: z.string(),
    contactPerson: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    mobile: z.string().optional(),

    // Address
    billingAddress: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingCountry: z.string().default('India'),
    billingPincode: z.string().optional(),
    shippingAddress: z.string().optional(),

    // Tax & Financial
    gstIn: z.string().optional(), // GSTIN format validation could be added
    panNumber: z.string().optional(),
    paymentTermId: z.string().optional(),
    tdsCategoryId: z.string().optional(),
    creditLimit: z.string().optional(), // Input as string, parse to number
    openingBalance: z.string().optional(),

    // Bank (Vendor)
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankIfscCode: z.string().optional(),

    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PartiesPage() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: parties = [], isLoading } = useQuery({
        queryKey: ['parties'],
        queryFn: getParties,
    });

    const mutation = useMutation({
        mutationFn: createParty,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['parties'] });
            setOpen(false);
            form.reset();
            toast.success("Party saved successfully");
        },
        onError: (error) => {
            toast.error("Failed to save party");
            console.error(error);
        }
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            displayName: '',
            type: '0', // Customer
            contactPerson: '',
            email: '',
            phone: '',
            mobile: '',
            billingAddress: '',
            billingCity: '',
            billingState: '',
            billingCountry: 'India',
            billingPincode: '',
            shippingAddress: '',
            gstIn: '',
            panNumber: '',
            creditLimit: '0',
            openingBalance: '0',
            notes: '',
        },
    });

    function onSubmit(values: FormValues) {
        const dto: CreatePartyDto = {
            name: values.name,
            displayName: values.displayName,
            type: parseInt(values.type),
            contactPerson: values.contactPerson || '',
            email: values.email || '',
            phone: values.phone || '',
            mobile: values.mobile,
            billingAddress: values.billingAddress,
            billingCity: values.billingCity,
            billingState: values.billingState,
            billingCountry: values.billingCountry,
            billingPincode: values.billingPincode,
            shippingAddress: values.shippingAddress,
            gstIn: values.gstIn,
            panNumber: values.panNumber,
            creditLimit: parseFloat(values.creditLimit || '0'),
            openingBalance: parseFloat(values.openingBalance || '0'),
            bankName: values.bankName,
            bankAccountNumber: values.bankAccountNumber,
            bankIfscCode: values.bankIfscCode,
            notes: values.notes
        };
        mutation.mutate(dto);
    }

    const columns: ColumnDef<Party>[] = [
        {
            accessorKey: 'name',
            header: 'Party Name',
        },
        {
            accessorKey: 'displayName',
            header: 'Display Name',
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <span className={`px-2 py-1 rounded text-xs ${row.original.type === 0 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>{row.original.type === 0 ? 'Customer' : 'Vendor'}</span>,
        },
        {
            accessorKey: 'contactPerson',
            header: 'Contact',
        },
        {
            accessorKey: 'mobile',
            header: 'Mobile',
        },
        {
            accessorKey: 'gstIn',
            header: 'GSTIN',
        },
        {
            accessorKey: 'openingBalance',
            header: 'Balance',
            cell: ({ row }) => {
                const val = row.original.openingBalance || 0;
                return (
                    <span className={val < 0 ? 'text-red-500' : 'text-green-600'}>
                        {val.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                );
            }
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customer & Vendor Master</h2>
                    <p className="text-muted-foreground">Manage your business partners and their details.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => form.reset()}>Add New Party</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-auto flex flex-col p-6 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Add New Party</DialogTitle>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
                                <ScrollArea className="flex-1 pr-4 -mr-4">
                                    <div className="space-y-4 p-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Party Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="0">Customer</SelectItem>
                                                                <SelectItem value="1">Vendor</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Legal Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Official Company Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Tabs defaultValue="general" className="w-full">
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="general">General</TabsTrigger>
                                                <TabsTrigger value="address">Address</TabsTrigger>
                                                <TabsTrigger value="tax">Tax & Financial</TabsTrigger>
                                                <TabsTrigger value="other">Other</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="general" className="space-y-4 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="displayName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Display Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Name shown in invoices" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="contactPerson"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Contact Person</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Email</FormLabel>
                                                                <FormControl>
                                                                    <Input type="email" placeholder="billing@company.com" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="mobile"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Mobile</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="+91 9876543210" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="phone"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Phone (Landline)</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="040-12345678" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="address" className="space-y-4 mt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium text-sm text-primary">Billing Address</h4>
                                                        <FormField control={form.control} name="billingAddress" render={({ field }) => (<FormItem><FormControl><Textarea placeholder="Address Line 1 & 2" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <FormField control={form.control} name="billingCity" render={({ field }) => (<FormItem><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={form.control} name="billingPincode" render={({ field }) => (<FormItem><FormControl><Input placeholder="Pincode" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <FormField control={form.control} name="billingState" render={({ field }) => (<FormItem><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={form.control} name="billingCountry" render={({ field }) => (<FormItem><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium text-sm text-primary">Shipping Address</h4>
                                                        <FormField control={form.control} name="shippingAddress" render={({ field }) => (<FormItem><FormControl><Textarea placeholder="Full Shipping Address" className="h-[132px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <p className="text-xs text-muted-foreground">Leave empty if same as billing.</p>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="tax" className="space-y-4 mt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="gstIn" render={({ field }) => (<FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input placeholder="29ABCDE1234F1Z5" className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="panNumber" render={({ field }) => (<FormItem><FormLabel>PAN</FormLabel><FormControl><Input placeholder="ABCDE1234F" className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="creditLimit" render={({ field }) => (<FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="openingBalance" render={({ field }) => (<FormItem><FormLabel>Opening Balance</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                </div>

                                                {form.watch("type") === "1" && (
                                                    <div className="space-y-4 pt-4 border-t">
                                                        <h4 className="font-medium text-sm text-primary">Vendor Bank Details</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <FormField control={form.control} name="bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={form.control} name="bankAccountNumber" render={({ field }) => (<FormItem><FormLabel>Account No</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                            <FormField control={form.control} name="bankIfscCode" render={({ field }) => (<FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="other" className="space-y-4 mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Notes / Remarks</FormLabel>
                                                            <FormControl>
                                                                <Textarea placeholder="Any internal notes related to this party..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </ScrollArea>

                                <div className="pt-2 border-t mt-auto">
                                    <Button type="submit" disabled={mutation.isPending} className="w-full">
                                        {mutation.isPending ? "Saving..." : "Save Party"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={parties} searchKey="displayName" />
            )}
        </div>
    );
}
