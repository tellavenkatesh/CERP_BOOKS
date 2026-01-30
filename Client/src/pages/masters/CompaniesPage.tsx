import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanies, createCompany, type Company, type CreateCompanyDto } from '@/api/masters';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Schema
const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    taxId: z.string().min(1, { message: 'Tax ID is required.' }),
    currency: z.string().default('INR'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompaniesPage() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    // Query
    const { data: companies = [], isLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: getCompanies,
    });

    // Mutation
    const mutation = useMutation({
        mutationFn: createCompany,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['companies'] });
            setOpen(false);
            form.reset();
        },
    });

    // Form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            taxId: '',
            currency: 'INR',
            address: '',
            city: '',
            state: '',
            country: '',
        },
    });

    function onSubmit(values: FormValues) {
        const dto: CreateCompanyDto = {
            name: values.name,
            taxId: values.taxId,
            currency: values.currency,
            address: values.address || '',
            city: values.city || '',
            state: values.state || '',
            country: values.country || ''
        } as any;
        mutation.mutate(dto);
    }

    // Columns
    const columns: ColumnDef<Company>[] = [
        {
            accessorKey: 'name',
            header: 'Company Name',
        },
        {
            accessorKey: 'taxId',
            header: 'Tax ID',
        },
        {
            accessorKey: 'city',
            header: 'City',
        },
        {
            accessorKey: 'country',
            header: 'Country',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Company</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Company</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Corp" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tax ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="GSTIN/VAT" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Save"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={companies} searchKey="name" />
            )}
        </div>
    );
}
