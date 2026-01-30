import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { type PaymentTerm, getPaymentTerms, createPaymentTerm } from '@/api/masters';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface PaymentTermsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (term: PaymentTerm) => void;
}

const formSchema = z.object({
    name: z.string().min(1, 'Term Name is required'),
    days: z.coerce.number().min(0, 'Days must be 0 or greater'),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaymentTermsDialog({ open, onOpenChange, onSelect }: PaymentTermsDialogProps) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);

    const { data: terms = [], isLoading } = useQuery({
        queryKey: ['paymentTerms'],
        queryFn: getPaymentTerms,
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            days: 0,
            description: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: createPaymentTerm,
        onSuccess: (newId, variables) => {
            queryClient.invalidateQueries({ queryKey: ['paymentTerms'] });
            toast.success("Payment term created successfully");
            setIsAdding(false);
            form.reset();
            // Optional: Auto-select if desired, but we don't have the full object back easily unless we refetch or construct it.
            // createPaymentTerm returns ID. variables has data.
            // We could call onSelect here if we want auto-select behavior.
        },
        onError: (err) => {
            toast.error("Failed to create payment term");
            console.error(err);
        }
    });

    function onSubmit(values: FormValues) {
        createMutation.mutate({
            ...values,
            description: values.description || '',
            isActive: true
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Configure Payment Terms</DialogTitle>
                    <DialogDescription>
                        Manage your payment terms. Add new terms to be used in transactions.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    {/* List of Existing Terms */}
                    <div className="rounded-md border max-h-[300px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Term Name</TableHead>
                                    <TableHead className="w-[100px]">Days</TableHead>
                                    <TableHead>Description</TableHead>
                                    {onSelect && <TableHead className="w-[80px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={onSelect ? 4 : 3} className="text-center py-4">Loading...</TableCell>
                                    </TableRow>
                                ) : terms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={onSelect ? 4 : 3} className="text-center py-4 text-muted-foreground">No payment terms found.</TableCell>
                                    </TableRow>
                                ) : (
                                    terms.map((term: PaymentTerm) => (
                                        <TableRow
                                            key={term.id}
                                            className={onSelect ? "cursor-pointer hover:bg-muted/50" : ""}
                                            onClick={() => {
                                                if (onSelect) {
                                                    onSelect(term);
                                                    onOpenChange(false);
                                                }
                                            }}
                                        >
                                            <TableCell className="font-medium">{term.name}</TableCell>
                                            <TableCell>{term.days}</TableCell>
                                            <TableCell>{term.description}</TableCell>
                                            {onSelect && (
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(term);
                                                        onOpenChange(false);
                                                    }}>Select</Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Add New Section */}
                    {isAdding ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="border rounded-md p-4 bg-muted/50 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Term Name <span className="text-red-500">*</span></Label>
                                                <FormControl>
                                                    <Input placeholder="e.g. Net 30" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="days"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Label>Number of Days <span className="text-red-500">*</span></Label>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value as string | number} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <Button
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800 hover:bg-transparent px-0"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New
                        </Button>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
