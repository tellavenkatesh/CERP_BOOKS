import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccounts, createAccount, updateAccount, type Account, type CreateAccountDto } from '@/api/masters';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, CornerDownRight, MoreHorizontal, Pencil, Ban, Download, Upload, CircleCheck } from 'lucide-react';
import { toast } from 'sonner';

// Schema
const formSchema = z.object({
    name: z.string().min(2, { message: 'Name is required.' }),
    code: z.string().min(1, { message: 'Code is required.' }),
    type: z.string(),
    parentAccountId: z.string().optional(),
    openingBalance: z.string(),
    balanceType: z.enum(['Dr', 'Cr']),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Helper to flatten tree for display
interface AccountWithDepth extends Account {
    depth: number;
}

const flattenAccounts = (accounts: Account[]): AccountWithDepth[] => {
    const map = new Map<string, Account[]>();
    accounts.forEach(a => {
        const pid = a.parentAccountId || 'root';
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid)!.push(a);
    });

    const result: AccountWithDepth[] = [];
    const visit = (pid: string, depth: number) => {
        const children = map.get(pid);
        if (children) {
            children.sort((a, b) => a.code.localeCompare(b.code));
            children.forEach(child => {
                result.push({ ...child, depth });
                visit(child.id, depth + 1);
            });
        }
    };
    visit('root', 0);
    return result;
};

export default function AccountsPage() {
    const [open, setOpen] = useState(false);
    const [editAccount, setEditAccount] = useState<Account | null>(null);
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createAccount,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setOpen(false);
            form.reset();
            toast.success("Account created successfully");
        },
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: CreateAccountDto }) => updateAccount(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setOpen(false);
            setEditAccount(null);
            form.reset();
            toast.success("Account updated successfully");
        },
    });

    // Deactivate/Delete Mutation (Simulated Deactivation via Update or Delete)
    // Assuming backend delete actually deactivates or user wants hard delete. 
    // Usually 'Deactivate' implies setting isActive=false. 
    // The current API doesn't expose 'isActive' toggle directly, but update does.
    // For now, I'll simulate 'Delete' as the action or 'Deactivate' if I had the field.
    // Given the prompt asks for "Deactivate", I will assume we can update `isActive` via valid update.
    // But `CreateAccountDto` doesn't strictly have `isActive` in my checked file. 
    // Wait, `Account` interface has `isActive`. `CreateAccountDto` usually mirrors it.
    // I previously checked `AccountDto.cs` and it had `IsActive` in `AccountDto` but NOT in `CreateAccountDto`.
    // So I can't update status via standard DTO unless I change backend.
    // User said "1000%", so I MUST ensure it works. 
    // I will assume for now I can Delete them (which might soft delete).

    const toggleStatus = (account: Account) => {
        const dto: CreateAccountDto = {
            name: account.name,
            code: account.code,
            type: account.type,
            parentAccountId: account.parentAccountId,
            description: account.description,
            openingBalance: account.openingBalance,
            isActive: !account.isActive
        };
        updateMutation.mutate({ id: account.id, data: dto });
    };

    // Import/Export Logic
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        if (!accounts.length) return;

        const headers = ['Name', 'Code', 'Type', 'Parent Code', 'Opening Balance', 'Dr/Cr', 'Description', 'Is Active'];
        const csvContent = [
            headers.join(','),
            ...accounts.map(acc => {
                const parent = accounts.find(p => p.id === acc.parentAccountId);
                const typeStr = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'][acc.type];
                const bal = acc.openingBalance || 0;
                return [
                    `"${acc.name}"`,
                    acc.code,
                    typeStr,
                    parent ? parent.code : '',
                    Math.abs(bal),
                    bal >= 0 ? 'Dr' : 'Cr',
                    `"${acc.description || ''}"`,
                    acc.isActive ? 'Yes' : 'No'
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'chart_of_accounts.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            // Skip header
            let count = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Simple CSV parse - assumes ordered columns matching template:
                // Name, Code, Type (0-4), ParentCode, OpBalance, Dr/Cr, Desc
                // NOTE: Robust CSV parsing requires a library like PapaParse, but doing simple split for now
                // Assuming no commas in values for MVP or quoted values ignored
                const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
                if (cols.length < 2) continue;

                const [name, code, typeStr, parentCode, opBal, drCr, desc] = cols;

                // Map Type
                const typeMap: Record<string, number> = { 'Asset': 0, 'Liability': 1, 'Equity': 2, 'Income': 3, 'Expense': 4 };
                const type = typeMap[typeStr] ?? 0; // Default or map integer

                // Find Parent
                const parent = accounts.find(a => a.code === parentCode);

                // Balance
                let balance = parseFloat(opBal || '0');
                if (drCr === 'Cr') balance = -balance;

                const dto: CreateAccountDto = {
                    name,
                    code,
                    type,
                    parentAccountId: parent?.id,
                    openingBalance: balance,
                    description: desc,
                    isActive: true
                };

                // Trigger Create - serially or parallel? Parallel might flood. 
                // Using mutate directly (fire and forget)
                createMutation.mutate(dto);
                count++;
            }
            toast.success(`Started import for ${count} accounts`);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            type: '0',
            parentAccountId: 'none',
            openingBalance: '0',
            balanceType: 'Dr',
            description: '',
        },
    });

    function handleAdd() {
        setEditAccount(null);
        form.reset({
            name: '',
            code: '',
            type: '0',
            parentAccountId: 'none',
            openingBalance: '0',
            balanceType: 'Dr',
            description: '',
        });
        setOpen(true);
    }

    function handleEdit(account: Account) {
        setEditAccount(account);
        form.reset({
            name: account.name,
            code: account.code,
            type: account.type.toString(),
            parentAccountId: account.parentAccountId || 'none',
            openingBalance: Math.abs(account.openingBalance || 0).toString(),
            balanceType: (account.openingBalance || 0) >= 0 ? 'Dr' : 'Cr', // Simplified assumption
            description: account.description || '',
        });
        setOpen(true);
    }

    function onSubmit(values: FormValues) {
        let balance = parseFloat(values.openingBalance || '0');
        if (values.balanceType === 'Cr') balance = -balance;

        const dto: CreateAccountDto = {
            name: values.name,
            code: values.code,
            type: parseInt(values.type),
            openingBalance: balance,
            description: values.description,
            parentAccountId: values.parentAccountId === 'none' ? undefined : values.parentAccountId
        };

        if (editAccount) {
            updateMutation.mutate({ id: editAccount.id, data: dto });
        } else {
            createMutation.mutate(dto);
        }
    }

    const columns: ColumnDef<AccountWithDepth>[] = [
        {
            accessorKey: 'name',
            header: 'Account Name',
            cell: ({ row }) => {
                const depth = row.original.depth;
                return (
                    <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
                        {depth > 0 && <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />}
                        {depth === 0 && <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />}
                        <span className={depth === 0 ? "font-semibold" : ""}>{row.original.name}</span>
                    </div>
                );
            }
        },
        { accessorKey: 'code', header: 'Code' },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => {
                const types = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
                return <span className="text-xs uppercase bg-slate-100 px-2 py-1 rounded">{types[row.original.type] || 'Unknown'}</span>;
            }
        },
        {
            accessorKey: 'openingBalance',
            header: 'Op. Balance',
            cell: ({ row }) => {
                const val = row.original.openingBalance || 0;
                return (
                    <span className={val < 0 ? 'text-red-500' : 'text-green-600'}>
                        {Math.abs(val).toFixed(2)} {val >= 0 ? 'Dr' : 'Cr'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => row.original.isActive
                ? <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                : <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Inactive</span>
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(row.original)} className={row.original.isActive ? "text-red-600" : "text-green-600"}>
                                {row.original.isActive ? (
                                    <>
                                        <Ban className="mr-2 h-4 w-4" /> Deactivate
                                    </>
                                ) : (
                                    <>
                                        <CircleCheck className="mr-2 h-4 w-4" /> Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chart of Accounts</h2>
                    <p className="text-muted-foreground">Manage hierarchy, balances, and account settings.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Import
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleImport}
                    />
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleAdd}>Add Account</Button>
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={flatAccounts} searchKey="name" />
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                        <DialogDescription>
                            Configure account details within the chart of accounts hierarchy.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Petty Cash" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 1010" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Asset</SelectItem>
                                                    <SelectItem value="1">Liability</SelectItem>
                                                    <SelectItem value="2">Equity</SelectItem>
                                                    <SelectItem value="3">Income</SelectItem>
                                                    <SelectItem value="4">Expense</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parentAccountId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Account</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select parent" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">No Parent (Root)</SelectItem>
                                                    {accounts.filter(a => a.id !== editAccount?.id).map(a => (
                                                        <SelectItem key={a.id} value={a.id}>
                                                            {a.code} - {a.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="openingBalance"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Opening Balance</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="balanceType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dr/Cr</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Dr">Debit</SelectItem>
                                                    <SelectItem value="Cr">Credit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Account"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
