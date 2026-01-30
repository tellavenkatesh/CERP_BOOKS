import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Play, Pause, RefreshCw, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { getRecurringTransactions, toggleRecurringStatus, type RecurringTransaction } from "@/api/recurring";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RecurringTransactionList() {
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["recurring-transactions"],
        queryFn: getRecurringTransactions,
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "Active" | "Paused" }) =>
            toggleRecurringStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
        }
    });

    const columns: ColumnDef<RecurringTransaction>[] = [
        {
            accessorKey: "templateName",
            header: "Template Name",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.getValue("templateName")}</div>
                    <div className="text-xs text-muted-foreground">{row.original.partyName}</div>
                </div>
            )
        },
        {
            accessorKey: "transactionType",
            header: "Type",
        },
        {
            accessorKey: "frequency",
            header: "Frequency",
        },
        {
            accessorKey: "nextRunDate",
            header: "Next Run",
            cell: ({ row }) => format(new Date(row.getValue("nextRunDate")), "dd/MM/yyyy"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className={`capitalize font-medium ${status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                        {status}
                    </div>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const tx = row.original;
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
                            {tx.status === "Active" ? (
                                <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: tx.id, status: "Paused" })}>
                                    <Pause className="mr-2 h-4 w-4" /> Pause
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: tx.id, status: "Active" })}>
                                    <Play className="mr-2 h-4 w-4" /> Resume
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => alert("Generate Now Triggered (Mock)")}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Generate Now
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Recurring Transactions</h1>
                <Link to="/financial/recurring/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Template
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={transactions} />
        </div>
    );
}
