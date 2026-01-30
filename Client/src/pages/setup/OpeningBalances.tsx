import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const openingBalancesSchema = z.object({
    openingBalanceDate: z.date(),
    accounts: z.array(z.object({
        name: z.string().min(1, "Account Name is required"),
        code: z.string().optional(),
        type: z.string().min(1, "Type is required"),
        debit: z.coerce.number().default(0),
        credit: z.coerce.number().default(0),
    })),
    customers: z.array(z.object({
        name: z.string().min(1, "Customer Name is required"),
        balance: z.coerce.number().default(0), // Always Debit
    })),
    vendors: z.array(z.object({
        name: z.string().min(1, "Vendor Name is required"),
        balance: z.coerce.number().default(0), // Always Credit
    })),
    items: z.array(z.object({
        name: z.string().min(1, "Item Name is required"),
        quantity: z.coerce.number().default(0),
        rate: z.coerce.number().default(0),
        value: z.coerce.number().default(0), // Always Debit (Asset)
    })),
});

type FormValues = z.infer<typeof openingBalancesSchema>;

export default function OpeningBalances() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("accounts");

    const form = useForm<FormValues>({
        resolver: zodResolver(openingBalancesSchema) as any,
        defaultValues: {
            openingBalanceDate: new Date(),
            accounts: [
                { name: "Cash", code: "CASH", type: "Asset", debit: 0, credit: 0 },
                { name: "Bank", code: "BANK", type: "Asset", debit: 0, credit: 0 },
                { name: "Capital", code: "CAP", type: "Equity", debit: 0, credit: 0 },
            ],
            customers: [],
            vendors: [],
            items: [],
        },
    });

    const { fields: accountFields, append: appendAccount, remove: removeAccount } = useFieldArray({
        control: form.control as any,
        name: "accounts",
    });

    const { fields: customerFields, append: appendCustomer, remove: removeCustomer } = useFieldArray({
        control: form.control as any,
        name: "customers",
    });

    const { fields: vendorFields, append: appendVendor, remove: removeVendor } = useFieldArray({
        control: form.control as any,
        name: "vendors",
    });

    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
        control: form.control as any,
        name: "items",
    });

    // Calculate Totals
    const totals = useMemo(() => {
        const values = form.getValues();

        // Accounts
        const accDebits = values.accounts.reduce((sum, acc) => sum + (Number(acc.debit) || 0), 0);
        const accCredits = values.accounts.reduce((sum, acc) => sum + (Number(acc.credit) || 0), 0);

        // Customers (Debit)
        const custDebits = values.customers.reduce((sum, cust) => sum + (Number(cust.balance) || 0), 0);

        // Vendors (Credit)
        const vendCredits = values.vendors.reduce((sum, vend) => sum + (Number(vend.balance) || 0), 0);

        // Inventory (Debit)
        const itemDebits = values.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.rate) || 0)), 0);

        const totalDebit = accDebits + custDebits + itemDebits;
        const totalCredit = accCredits + vendCredits;
        const difference = totalDebit - totalCredit;

        return { totalDebit, totalCredit, difference };
    }, [form.watch()]); // Watch all changes

    // Auto-adjust logic
    const handleAdjustEquity = () => {
        const diff = totals.difference;
        if (diff === 0) return;

        const currentAccounts = form.getValues().accounts;
        const equityIndex = currentAccounts.findIndex(a => a.name.toLowerCase().includes("equity") || a.name.toLowerCase().includes("capital"));

        if (equityIndex >= 0) {
            const account = currentAccounts[equityIndex];
            // If Debits > Credits (Positive Diff), we need more Credit to balance
            // If Credits > Debits (Negative Diff), we need more Debit

            // Example: Dr 100, Cr 0. Diff 100. Need Cr 100.
            // Logic: Credit += Diff

            const newCredit = (Number(account.credit) || 0) + diff;
            const newDebit = (Number(account.debit) || 0);

            // If newCredit is negative, means we should have debited?
            // Simpler: Just mathematical addition to Credit side? 
            // If Diff is positive (Excess Debit), add to Equity Credit.
            // If Diff is negative (Excess Credit), add to Equity Debit? Or subtract from Equity Credit.

            // Let's assume standard "Opening Balance Equity".
            // If Dr > Cr, add (Dr - Cr) to Equity Credit.
            if (diff > 0) {
                form.setValue(`accounts.${equityIndex}.credit`, (Number(account.credit) || 0) + diff);
            } else {
                // If Cr > Dr, diff is negative.
                // Add abs(diff) to Equity Debit
                form.setValue(`accounts.${equityIndex}.debit`, (Number(account.debit) || 0) + Math.abs(diff));
            }
        } else {
            // Create new Equity Account
            if (diff > 0) {
                appendAccount({ name: "Opening Balance Equity", type: "Equity", code: "OBE", debit: 0, credit: diff });
            } else {
                appendAccount({ name: "Opening Balance Equity", type: "Equity", code: "OBE", debit: Math.abs(diff), credit: 0 });
            }
        }
    };

    async function onSubmit(values: FormValues) {
        if (Math.abs(totals.difference) > 0.01) {
            alert("Opening Balances do not match! Please adjust the difference.");
            return;
        }
        console.log("Submitted:", values);
        navigate('/');
    }

    return (
        <div className="container mx-auto py-10 max-w-5xl">


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Opening Balances</h1>
                            <p className="text-muted-foreground">Set your initial financial position.</p>
                        </div>
                        <FormField
                            control={form.control as any}
                            name="openingBalanceDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Opening Balance Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                            <TabsTrigger value="accounts">Accounts (GL)</TabsTrigger>
                            <TabsTrigger value="customers">Customers (AR)</TabsTrigger>
                            <TabsTrigger value="vendors">Vendors (AP)</TabsTrigger>
                            <TabsTrigger value="items">Inventory</TabsTrigger>
                        </TabsList>

                        {/* ACCOUNTS TAB - GRID VIEW */}
                        <TabsContent value="accounts" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Ledger Accounts</CardTitle>
                                    <CardDescription>Enter balances for Assets, Liabilities, Equity, etc.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {/* Header Row */}
                                    <div className="flex gap-4 font-semibold text-sm text-muted-foreground px-2">
                                        <div className="flex-1">Account Name</div>
                                        <div className="w-32">Type</div>
                                        <div className="w-32 text-right">Debit</div>
                                        <div className="w-32 text-right">Credit</div>
                                        <div className="w-10"></div>
                                    </div>

                                    {accountFields.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg">
                                            No accounts added yet.
                                        </div>
                                    )}

                                    {accountFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-start p-2 hover:bg-muted/50 rounded-lg group">
                                            <FormField
                                                control={form.control as any}
                                                name={`accounts.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-0">
                                                        <FormControl><Input placeholder="Account Name" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`accounts.${index}.type`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32 space-y-0">
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Asset">Asset</SelectItem>
                                                                <SelectItem value="Liability">Liability</SelectItem>
                                                                <SelectItem value="Equity">Equity</SelectItem>
                                                                <SelectItem value="Income">Income</SelectItem>
                                                                <SelectItem value="Expense">Expense</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`accounts.${index}.debit`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32 space-y-0">
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="text-right"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    // Optional: Clear Credit if Debit has value? 
                                                                    // keeping it flexible for complex manual entries
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`accounts.${index}.credit`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32 space-y-0">
                                                        <FormControl>
                                                            <Input type="number" className="text-right" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" className="w-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeAccount(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="pt-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => appendAccount({ name: "", type: "Asset", debit: 0, credit: 0 })}>
                                            <Plus className="h-4 w-4 mr-2" /> Add Account
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="customers" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customers (Receivables)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {customerFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-center">
                                            <FormField
                                                control={form.control as any}
                                                name={`customers.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-0">
                                                        <FormControl><Input placeholder="Customer Name" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`customers.${index}.balance`}
                                                render={({ field }) => (
                                                    <FormItem className="w-40 space-y-0">
                                                        <FormControl><Input type="number" className="text-right" placeholder="Debit Amount" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomer(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendCustomer({ name: "", balance: 0 })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Customer
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="vendors" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vendors (Payables)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {vendorFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-center">
                                            <FormField
                                                control={form.control as any}
                                                name={`vendors.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-0">
                                                        <FormControl><Input placeholder="Vendor Name" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`vendors.${index}.balance`}
                                                render={({ field }) => (
                                                    <FormItem className="w-40 space-y-0">
                                                        <FormControl><Input type="number" className="text-right" placeholder="Credit Amount" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeVendor(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendVendor({ name: "", balance: 0 })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Vendor
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="items" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Stock</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4 font-semibold text-sm text-muted-foreground px-2">
                                        <div className="flex-1">Item Name</div>
                                        <div className="w-32 text-right">Quantity</div>
                                        <div className="w-32 text-right">Rate</div>
                                        <div className="w-32 text-right">Value</div>
                                        <div className="w-10"></div>
                                    </div>
                                    {itemFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-center">
                                            <FormField
                                                control={form.control as any}
                                                name={`items.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-0">
                                                        <FormControl><Input placeholder="Item Name" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32 space-y-0">
                                                        <FormControl><Input type="number" className="text-right" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`items.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32 space-y-0">
                                                        <FormControl><Input type="number" className="text-right" {...field} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control as any}
                                                name={`items.${index}.value`}
                                                render={({ field: _ }) => (
                                                    <FormItem className="w-32 space-y-0">
                                                        <FormControl>
                                                            <Input type="number" className="text-right bg-muted" readOnly
                                                                value={
                                                                    ((Number(form.watch(`items.${index}.quantity`)) || 0) *
                                                                        (Number(form.watch(`items.${index}.rate`)) || 0)).toFixed(2)
                                                                }
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendItem({ name: "", quantity: 0, rate: 0, value: 0 })}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Item
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>

                    {/* SUMMARY FOOTER */}
                    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-10">
                        <div className="container mx-auto max-w-5xl flex items-center justify-between">
                            <div className="flex gap-8 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Total Debits</span>
                                    <span className="font-bold text-lg text-emerald-600">{totals.totalDebit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Total Credits</span>
                                    <span className="font-bold text-lg text-blue-600">{totals.totalCredit.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Difference</span>
                                    <span className={cn("font-bold text-lg", Math.abs(totals.difference) > 0.01 ? "text-destructive" : "text-slate-500")}>
                                        {Math.abs(totals.difference).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} {Math.abs(totals.difference) > 0.01 ? (totals.difference > 0 ? " Dr" : " Cr") : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {Math.abs(totals.difference) > 0.01 && (
                                    <Button type="button" variant="secondary" onClick={handleAdjustEquity} className="hidden sm:flex">
                                        Adjust to Equity
                                    </Button>
                                )}

                                <Button type="submit" disabled={Math.abs(totals.difference) > 0.01}>
                                    Complete Setup
                                </Button>
                            </div>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    );
}
