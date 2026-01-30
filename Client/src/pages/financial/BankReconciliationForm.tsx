import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Check, Upload, ArrowRightLeft, RefreshCw } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getAccounts } from "@/api/masters";
import { getUnreconciledTransactions, createBankReconciliation, type UnreconciledTransactionDto } from "@/api/financial";

const formSchema = z.object({
    accountId: z.string().min(1, "Account is required"),
    statementDate: z.string().min(1, "Date is required"),
    statementBalance: z.coerce.number(),
    selectedItems: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

// Mock Statement Data Type
interface StatementLine {
    id: string;
    date: string;
    description: string;
    amount: number;
    matched: boolean;
}

export default function BankReconciliationForm() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // System Transactions
    const [transactions, setTransactions] = useState<UnreconciledTransactionDto[]>([]);

    // Statement Lines (Mock for now)
    const [statementLines, setStatementLines] = useState<StatementLine[]>([]);

    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
    const bankAccounts = accounts.filter(a => a.type === 0); // 0 = Asset (Bank)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            accountId: "",
            statementDate: format(new Date(), "yyyy-MM-dd"),
            statementBalance: 0,
            selectedItems: [],
        },
    });

    const watchAccountId = form.watch("accountId");
    const watchStatementBalance = form.watch("statementBalance");
    const watchSelectedItems = form.watch("selectedItems");

    useEffect(() => {
        if (watchAccountId) {
            getUnreconciledTransactions(watchAccountId).then(data => {
                setTransactions(data);
                form.setValue("selectedItems", []);
            });
        }
    }, [watchAccountId, form]);

    // CSV File Import
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const lines = content.split(/\r?\n/);
            const parsedData: StatementLine[] = [];

            // Skip header if present (Assuming Date, Description, Amount)
            // Or try to detect. For simplicity, assume Header exists.

            lines.forEach((line, index) => {
                if (index === 0) return; // Skip header
                if (!line.trim()) return;

                const cols = line.split(",");
                if (cols.length >= 3) {
                    parsedData.push({
                        id: `CSV-${index}`,
                        date: cols[0].trim(), // Expecting YYYY-MM-DD or similar
                        description: cols[1].trim(),
                        amount: parseFloat(cols[2].trim()),
                        matched: false
                    });
                }
            });

            setStatementLines(parsedData);
            alert(`Imported ${parsedData.length} lines.`);
        };
        reader.readAsText(file);
    };

    // Auto Match Logic
    const handleAutoMatch = () => {
        const newSelected: string[] = [...watchSelectedItems];
        const newStatementLines = [...statementLines];

        newStatementLines.forEach(line => {
            // Find a transaction with same Amount and nearby Date (optional date check)
            // For now, exact amount match only
            const match = transactions.find(t =>
                Math.abs(t.amount - line.amount) < 0.01 &&
                !newSelected.includes(t.id)
                // && t.date === line.date // Strict date matching?
            );

            if (match) {
                newSelected.push(match.id);
                line.matched = true;
            }
        });

        form.setValue("selectedItems", newSelected);
        setStatementLines(newStatementLines);
        alert(`Auto-matched ${newSelected.length - watchSelectedItems.length} transactions.`);
    };

    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            const itemsToReconcile = transactions
                .filter(t => values.selectedItems.includes(t.id))
                .map(t => ({
                    transactionId: t.id,
                    originalIdType: t.originalIdType,
                    transactionDate: t.date,
                    amount: t.amount,
                    description: t.description
                }));

            return createBankReconciliation({
                accountId: values.accountId,
                statementDate: values.statementDate,
                statementBalance: values.statementBalance,
                reconciledItems: itemsToReconcile
            });
        },
        onSuccess: () => {
            alert("Reconciliation Saved Successfully");
            form.reset({
                accountId: "",
                statementDate: format(new Date(), "yyyy-MM-dd"),
                statementBalance: 0,
                selectedItems: [],
            });
            setTransactions([]);
            setStatementLines([]);
        },
        onError: (error) => {
            console.error(error);
            alert("Failed to save reconciliation");
        },
    });

    const onSubmit = (values: FormValues) => {
        if (values.selectedItems.length === 0) {
            alert("Please select at least one transaction to reconcile.");
            return;
        }
        setIsSubmitting(true);
        mutation.mutate(values);
        setIsSubmitting(false);
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        const current = form.getValues("selectedItems");
        if (checked) {
            form.setValue("selectedItems", [...current, id]);
        } else {
            form.setValue("selectedItems", current.filter(item => item !== id));
        }
    };

    const selectedTransactions = transactions.filter(t => watchSelectedItems.includes(t.id));
    const totalDeposits = selectedTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = selectedTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const clearedBalance = totalDeposits - totalWithdrawals;
    const difference = watchStatementBalance - clearedBalance; // Simplified

    return (
        <div className="container mx-auto py-6 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleAutoMatch}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Auto-Match
                    </Button>
                    <Button variant="default" size="sm" onClick={form.handleSubmit(onSubmit)} disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Reconciliation"}
                    </Button>
                </div>
            </div>

            <Card className="mb-4">
                <CardContent className="py-4">
                    <Form {...form}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank Account</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="statementDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statement Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="statementBalance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statement Balance</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col justify-end">
                                <div className={`text-xl font-bold ${Math.abs(difference) > 0.01 ? "text-red-500" : "text-green-600"} text-right`}>
                                    Diff: {difference.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </Form>
                </CardContent>
            </Card>

            <div className="flex-1 grid grid-cols-2 gap-4 h-full overflow-hidden">
                {/* Left Panel: Statement */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="py-3 bg-muted/50 flex flex-row justify-between items-center">
                        <CardTitle className="text-sm font-medium">Bank Statement Lines</CardTitle>
                        <div>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                id="csv-upload"
                                onChange={handleFileUpload}
                            />
                            <Button variant="outline" size="sm" onClick={() => document.getElementById("csv-upload")?.click()}>
                                <Upload className="mr-2 h-3 w-3" /> Import CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30px]"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Desc</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statementLines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No statement uploaded.<br />Click Import to load CSV.
                                        </TableCell>
                                    </TableRow>
                                ) : statementLines.map(line => (
                                    <TableRow key={line.id}>
                                        <TableCell><Checkbox /></TableCell>
                                        <TableCell>{line.date}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={line.description}>{line.description}</TableCell>
                                        <TableCell className="text-right">{line.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Right Panel: System */}
                <Card className="flex flex-col h-full">
                    <CardHeader className="py-3 bg-muted/50 flex flex-row justify-between items-center">
                        <CardTitle className="text-sm font-medium">System Transactions</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => {
                            if (watchAccountId) getUnreconciledTransactions(watchAccountId).then(setTransactions)
                        }}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30px]"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Desc</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No unreconciled transactions.
                                        </TableCell>
                                    </TableRow>
                                ) : transactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={watchSelectedItems.includes(t.id)}
                                                onCheckedChange={(checked) => handleCheckboxChange(t.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>{format(new Date(t.date), "dd/MM")}</TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={t.description}>{t.description}</TableCell>
                                        <TableCell className="text-right">{t.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
