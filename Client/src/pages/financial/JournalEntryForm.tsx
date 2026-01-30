import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Trash2, Save, Send } from "lucide-react";

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
import { getAccounts, getParties } from "@/api/masters";
import { createJournalEntry, getJournalEntryById, updateJournalEntry } from "@/api/financial";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const lineSchema = z.object({
    accountId: z.string().min(1, "Account is required"),
    partyId: z.string().optional(),
    description: z.string().optional(),
    debitAmount: z.coerce.number().min(0),
    creditAmount: z.coerce.number().min(0),
});

const formSchema = z.object({
    journalDate: z.string().min(1, "Date is required"),
    narration: z.string().min(1, "Narration is required"),
    status: z.string().default("Draft"),
    lines: z.array(lineSchema).min(2, "At least 2 lines required")
        .refine((lines) => {
            const totalDebit = lines.reduce((sum, line) => sum + line.debitAmount, 0);
            const totalCredit = lines.reduce((sum, line) => sum + line.creditAmount, 0);
            return Math.abs(totalDebit - totalCredit) < 0.01;
        }, "Total Debits must equal Total Credits"),
});

type FormValues = z.infer<typeof formSchema>;

export default function JournalEntryForm() {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
    const { data: parties = [] } = useQuery({ queryKey: ["parties"], queryFn: getParties });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            journalDate: format(new Date(), "yyyy-MM-dd"),
            narration: "",
            status: "Draft",
            lines: [
                { accountId: "", partyId: "", description: "", debitAmount: 0, creditAmount: 0 },
                { accountId: "", partyId: "", description: "", debitAmount: 0, creditAmount: 0 },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lines",
    });

    // Load Data for Edit
    useEffect(() => {
        if (id) {
            getJournalEntryById(id).then((data) => {
                form.reset({
                    journalDate: format(new Date(data.journalDate), "yyyy-MM-dd"),
                    narration: data.narration,
                    status: data.status as any,
                    lines: data.lines.map((l: any) => ({
                        accountId: l.accountId,
                        partyId: l.partyId || "", // Ensure empty string if null
                        description: l.description || "",
                        debitAmount: l.debitAmount,
                        creditAmount: l.creditAmount
                    }))
                });
            });
        }
    }, [id, form]);

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const payload = {
                ...values,
                lines: values.lines.map(line => ({
                    ...line,
                    partyId: (line.partyId === "none" || line.partyId === "") ? undefined : line.partyId
                }))
            };
            if (isEditMode) {
                await updateJournalEntry(id!, payload as any);
            } else {
                await createJournalEntry(payload as any);
            }
        },
        onSuccess: () => {
            console.log("Journal Entry saved successfully");
            queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
            navigate("/financial/journal");
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to save journal entry");
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        mutation.mutate(values);
        setIsSubmitting(false);
    };

    const handleSave = (status: string) => {
        form.setValue("status", status);
        form.handleSubmit(onSubmit)();
    };

    const totalDebit = form.watch("lines").reduce((sum, line) => sum + (Number(line.debitAmount) || 0), 0);
    const totalCredit = form.watch("lines").reduce((sum, line) => sum + (Number(line.creditAmount) || 0), 0);

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-5xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Journal Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="journalDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="narration"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Narration</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter narration" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="border rounded-md p-4 bg-muted/20">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-lg">Lines</h3>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => append({ accountId: "", partyId: "", description: "", debitAmount: 0, creditAmount: 0 })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Line
                                    </Button>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[25%]">Account</TableHead>
                                            <TableHead className="w-[20%]">Party (Optional)</TableHead>
                                            <TableHead className="w-[25%]">Description</TableHead>
                                            <TableHead className="w-[12%] text-right">Debit</TableHead>
                                            <TableHead className="w-[12%] text-right">Credit</TableHead>
                                            <TableHead className="w-[6%]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`lines.${index}.accountId`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Account" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {accounts.map((acc) => (
                                                                            <SelectItem key={acc.id} value={acc.id}>
                                                                                {acc.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`lines.${index}.partyId`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Party" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">None</SelectItem>
                                                                        {parties.map((party) => (
                                                                            <SelectItem key={party.id} value={party.id}>
                                                                                {party.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`lines.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Line Desc" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`lines.${index}.debitAmount`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" className="text-right" {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                            if (parseFloat(e.target.value) > 0) {
                                                                                form.setValue(`lines.${index}.creditAmount`, 0);
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`lines.${index}.creditAmount`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" className="text-right" {...field}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                            if (parseFloat(e.target.value) > 0) {
                                                                                form.setValue(`lines.${index}.debitAmount`, 0);
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="flex justify-end gap-8 mt-4 pr-12 font-bold">
                                    <span>Total:</span>
                                    <span className={totalDebit !== totalCredit ? "text-destructive" : "text-green-600"}>
                                        Dr: {totalDebit.toFixed(2)}
                                    </span>
                                    <span className={totalDebit !== totalCredit ? "text-destructive" : "text-green-600"}>
                                        Cr: {totalCredit.toFixed(2)}
                                    </span>
                                </div>
                                {form.formState.errors.lines?.root && (
                                    <p className="text-sm font-medium text-destructive mt-2 text-right">
                                        {form.formState.errors.lines.root.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/financial/journal")}>
                                    Cancel
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => handleSave("Draft")} disabled={isSubmitting || mutation.isPending}>
                                    <Save className="mr-2 h-4 w-4" /> Save Draft
                                </Button>
                                <Button type="button" onClick={() => handleSave("Posted")} disabled={isSubmitting || mutation.isPending}>
                                    <Send className="mr-2 h-4 w-4" /> Post
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
