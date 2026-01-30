import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoices, approveInvoice, type InvoiceDto } from "@/api/sales";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SalesInvoicesPage() {
    const queryClient = useQueryClient();
    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: getInvoices,
    });

    const approveMutation = useMutation({
        mutationFn: approveInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });

    const columns: ColumnDef<InvoiceDto>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice #",
        },
        {
            accessorKey: "invoiceDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.invoiceDate), "dd/MM/yyyy"),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
        },
        {
            accessorKey: "totalAmount",
            header: "Total",
            cell: ({ row }) =>
                new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(row.original.totalAmount),
        },
        {
            accessorKey: "balanceAmount",
            header: "Balance",
            cell: ({ row }) =>
                new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(row.original.balanceAmount),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${row.original.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        row.original.status === 'Posted' || row.original.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                            row.original.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                row.original.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                    row.original.status === 'PartiallyPaid' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                    {row.original.status}
                </span>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const invoice = row.original;
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
                            {invoice.status === 'Draft' && (
                                <DropdownMenuItem onClick={() => approveMutation.mutate(invoice.id)}>
                                    Approve & Post
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}>
                                Copy Invoice Number
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales Invoices</h2>
                    <p className="text-muted-foreground">Manage customer invoices and billing.</p>
                </div>
                <Link to="/sales/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={invoices} searchKey="customerName" />
            )}
        </div>
    );
}
