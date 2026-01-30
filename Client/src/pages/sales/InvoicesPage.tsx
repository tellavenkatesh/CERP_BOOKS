import { useQuery } from '@tanstack/react-query';
import { getInvoices, type InvoiceDto } from '@/api/sales';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoicesPage() {
    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: getInvoices,
    });

    const columns: ColumnDef<InvoiceDto>[] = [
        {
            accessorKey: 'invoiceNumber',
            header: 'Invoice #',
        },
        {
            accessorKey: 'invoiceDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.invoiceDate), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'customerName',
            header: 'Customer',
        },
        {
            accessorKey: 'totalAmount',
            header: 'Total',
            cell: ({ row }) => row.original.totalAmount.toFixed(2),
        },
        {
            accessorKey: 'balanceAmount',
            header: 'Balance',
            cell: ({ row }) => row.original.balanceAmount.toFixed(2),
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                <Link to="/sales/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
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
