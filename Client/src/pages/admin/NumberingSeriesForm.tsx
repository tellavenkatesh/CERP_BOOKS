import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createNumberingSeries } from "@/api/masters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
    entityName: z.string().min(1, "Voucher Type is required"),
    prefix: z.string().max(20).optional(),
    startingNumber: z.coerce.number().min(1, "Starting Number must be 1 or greater"),
    paddingLength: z.coerce.number().min(1, "Padding Length must be at least 1").max(20).default(4),
    resetFrequency: z.string(), // We'll parse to number
    suffix: z.string().max(20).optional(),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const entityOptions = [
    "Invoice",
    "Bill",
    "Journal Entry",
    "Payment",
    "Receipt",
    "Credit Note",
    "Debit Note",
    "Quote",
    "Purchase Order"
];

export default function NumberingSeriesForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            entityName: "",
            prefix: "",
            startingNumber: 1,
            paddingLength: 4,
            resetFrequency: "0", // Default: Never
            suffix: "",
            isDefault: false,
            isActive: true,
        },
    });

    const mutation = useMutation({
        mutationFn: createNumberingSeries,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["numberingSeries"] });
            navigate("/admin/numbering-series");
        },
    });

    const onSubmit = (values: FormValues) => {
        setIsSubmitting(true);
        const requestData = {
            ...values,
            prefix: values.prefix || "",
            suffix: values.suffix || "",
            resetFrequency: parseInt(values.resetFrequency),
        };
        mutation.mutate(requestData as any);
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto py-6 max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Numbering Series</h1>
                    <p className="text-muted-foreground">Configure document numbering format.</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="entityName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Voucher Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {entityOptions.map(option => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
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
                                    name="resetFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reset Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Never</SelectItem>
                                                    <SelectItem value="1">Yearly</SelectItem>
                                                    <SelectItem value="2">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="prefix"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prefix</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. INV-" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startingNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Starting Number</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="paddingLength"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Padding Length</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">e.g. 4 for 0001</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="suffix"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Suffix (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. /2024" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-6 pt-4 border-t">
                                <FormField
                                    control={form.control}
                                    name="isDefault"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Set as Default Series</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Active</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Create Series
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
