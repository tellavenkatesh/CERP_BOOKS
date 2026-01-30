import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { createRecurringTransaction, Frequency, TransactionType } from "@/api/recurring";

const formSchema = z.object({
    templateName: z.string().min(1, "Template Name is required"),
    transactionType: z.enum([TransactionType.Invoice, TransactionType.Bill, TransactionType.Payment, TransactionType.Journal]),
    frequency: z.enum([Frequency.Daily, Frequency.Weekly, Frequency.Monthly, Frequency.Quarterly, Frequency.Yearly]),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().optional(),

    // Dynamic Payload Fields (Simplified for visual demo)
    partyName: z.string().optional(), // For Invoice/Bill
    amount: z.coerce.number().optional(), // For Payment/Bill
    description: z.string().optional(), // For Journal
    autoGenerate: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function RecurringTransactionForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            templateName: "",
            transactionType: "Invoice",
            frequency: "Monthly",
            startDate: format(new Date(), "yyyy-MM-dd"),
            autoGenerate: false,
        },
    });

    const watchType = form.watch("transactionType");

    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            // Map flat form to structured request if needed
            // For now passing as is to mock
            return createRecurringTransaction({
                ...values,
                transactionData: {
                    party: values.partyName,
                    amount: values.amount,
                    description: values.description
                }
            } as any);
        },
        onSuccess: () => {
            console.log("Recurring Template created");
            queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
            navigate("/financial/recurring");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to create template");
        },
    });

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(values);
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Recurring Template</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Configuration Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="templateName"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Template Name</FormLabel>
                                            <FormControl><Input placeholder="e.g. Monthly Rent" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="transactionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.values(TransactionType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {Object.values(Frequency).map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date (Optional)</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Transaction Details (Dynamic) */}
                            <Card className="bg-muted/30 border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Transaction Payload</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {(watchType === "Invoice" || watchType === "Bill" || watchType === "Payment") && (
                                        <FormField
                                            control={form.control}
                                            name="partyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Party Name (Customer/Vendor)</FormLabel>
                                                    <FormControl><Input placeholder="Enter Party Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {(watchType === "Payment" || watchType === "Bill" || watchType === "Invoice") && (
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {watchType === "Journal" && (
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Narration</FormLabel>
                                                    <FormControl><Textarea placeholder="Journal Narration" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {/* Note: In a real app, we'd include the full item grids here */}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        * Simplified payload for demonstration. Full items grid would appear here.
                                    </p>
                                </CardContent>
                            </Card>

                            <FormField
                                control={form.control}
                                name="autoGenerate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Auto-Generate</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                If enabled, transaction is created automatically on run date.
                                                Otherwise, requires manual approval.
                                            </div>
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

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/financial/recurring")}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Save Template"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
