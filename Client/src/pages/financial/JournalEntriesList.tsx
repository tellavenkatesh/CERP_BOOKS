import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getJournalEntries } from "@/api/financial";
import { type ColumnDef } from "@tanstack/react-table";
import { type JournalEntry } from "@/api/financial";

const columns: ColumnDef<JournalEntry>[] = [
    {
        accessorKey: "journalNumber",
        header: "Journal #",
    },
    {
        accessorKey: "journalDate",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("journalDate")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "narration",
        header: "Narration",
    },
    {
        id: "debitAmount",
        header: () => <div className="text-right">Total Debit</div>,
        cell: ({ row }) => {
            const lines = row.original.lines || [];
            const total = lines.reduce((sum, line) => sum + line.debitAmount, 0);
            return <div className="text-right">{total.toFixed(2)}</div>;
        },
    },
    {
        id: "creditAmount",
        header: () => <div className="text-right">Total Credit</div>,
        cell: ({ row }) => {
            const lines = row.original.lines || [];
            const total = lines.reduce((sum, line) => sum + line.creditAmount, 0);
            return <div className="text-right">{total.toFixed(2)}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className={`capitalize font-medium ${status === 'posted' ? 'text-green-600' : 'text-amber-600'}`}>
                    {status || 'Draft'}
                </div>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end">
                    <Link to={`/financial/journal/${row.original.id}`}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            );
        }
    },
];

export default function JournalEntriesList() {
    const { data: entries = [], isLoading } = useQuery({
        queryKey: ["journal-entries"],
        queryFn: getJournalEntries,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Journal Entries</h1>
                <Link to="/financial/journal/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Entry
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={entries} />
        </div>
    );
}
