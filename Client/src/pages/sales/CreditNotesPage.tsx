import { useQuery } from "@tanstack/react-query";
import { getCreditNotes, type CreditNote } from "@/api/sales";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function CreditNotesPage() {
    const { data: creditNotes = [], isLoading } = useQuery({
        queryKey: ["credit-notes"],
        queryFn: getCreditNotes,
    });

    const columns: ColumnDef<CreditNote>[] = [
        {
            accessorKey: "creditNoteNumber",
            header: "CN #",
        },
        {
            accessorKey: "creditNoteDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.creditNoteDate), "dd/MM/yyyy"),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
        },
        {
            accessorKey: "invoiceNumber",
            header: "Invoice #",
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) =>
                new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(row.original.totalAmount),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${row.original.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        row.original.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            row.original.status === 'Refunded' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>
                    {row.original.status}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Credit Notes</h2>
                    <p className="text-muted-foreground">Manage sales returns and credit notes.</p>
                </div>
                <Link to="/sales/credit-notes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Credit Note
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={creditNotes} searchKey="customerName" />
            )}
        </div>
    );
}
