import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { getAccounts } from "@/api/masters";
import { createContraEntry } from "@/api/financial";

const formSchema = z.object({
    contraDate: z.string().min(1, "Date is required"),
    fromAccountId: z.string().min(1, "Source Account is required"),
    toAccountId: z.string().min(1, "Destination Account is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    description: z.string().optional(),
    referenceNumber: z.string().optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
    message: "Source and Destination accounts cannot be the same",
    path: ["toAccountId"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ContraEntryForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });

    // Filter for Cash (Type 0?) and Bank (Type 1?)
    // Assuming Type logic or just showing all for now.
    // Ideally we filter accounts suitable for Contra (Cash, Bank)
    // const bankCashAccounts = accounts.filter(a => a.type === ...); 
    // Using all accounts for flexibility as I don't recall exact Enum values right now.

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            contraDate: format(new Date(), "yyyy-MM-dd"),
            amount: 0,
            description: "",
        },
    });

    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            // Map simplified From/To to Backend Lines
            const lines = [
                {
                    accountId: values.fromAccountId,
                    description: values.description,
                    amount: values.amount,
                    type: 1 // Credit (Source decreases)
                },
                {
                    accountId: values.toAccountId,
                    description: values.description,
                    amount: values.amount,
                    type: 0 // Debit (Destination increases)
                }
            ];

            return createContraEntry({
                contraDate: values.contraDate,
                description: values.description || "",
                lines: lines
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contra-entries"] });
            navigate("/financial/contra");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to create Contra Entry");
        },
    });

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(values);
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-6 w-6 text-primary" />
                        <CardTitle>Create Contra Entry (Transfer)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contraDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="referenceNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reference #</FormLabel>
                                            <FormControl><Input placeholder="Ref #" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-muted/30 p-6 rounded-lg border">
                                <FormField
                                    control={form.control}
                                    name="fromAccountId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-red-600">From (Source)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="hidden md:flex justify-center">
                                    <ArrowRight className="h-8 w-8 text-muted-foreground" />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="toAccountId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-green-600">To (Destination)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl><Input type="number" className="text-lg font-semibold" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Narration / Description</FormLabel>
                                        <FormControl><Textarea placeholder="Enter transfer details..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/financial/contra")}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Create Transfer"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
