import { useQuery } from '@tanstack/react-query';
import { getBills, type BillDto } from '@/api/purchase';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function PurchaseBillsPage() {
    const { data: bills = [], isLoading } = useQuery({
        queryKey: ['bills'],
        queryFn: getBills,
    });

    const columns: ColumnDef<BillDto>[] = [
        {
            accessorKey: 'billNumber',
            header: 'Bill #',
        },
        {
            accessorKey: 'vendorBillNumber',
            header: 'Vendor Ref',
        },
        {
            accessorKey: 'billDate',
            header: 'Bill Date',
            cell: ({ row }) => format(new Date(row.original.billDate), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'dueDate',
            header: 'Due Date',
            cell: ({ row }) => format(new Date(row.original.dueDate), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'vendorName',
            header: 'Vendor',
        },
        {
            accessorKey: 'totalAmount',
            header: 'Bill Amt',
            cell: ({ row }) => row.original.totalAmount.toFixed(2),
        },
        {
            accessorKey: 'tdsAmount',
            header: 'TDS',
            cell: ({ row }) => row.original.tdsAmount?.toFixed(2) || '0.00',
        },
        {
            accessorKey: 'netPayable',
            header: 'Net Payable',
            cell: ({ row }) => row.original.netPayable?.toFixed(2) || row.original.totalAmount.toFixed(2),
        },
        {
            accessorKey: 'paidAmount',
            header: 'Paid',
            cell: ({ row }) => row.original.paidAmount?.toFixed(2) || '0.00',
        },
        {
            accessorKey: 'balanceAmount',
            header: 'Balance',
            cell: ({ row }) => (
                <span className="font-semibold text-red-600">
                    {row.original.balanceAmount?.toFixed(2) || row.original.totalAmount.toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`capitalize ${row.original.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {row.original.status}
                </span>
            )
        },
        {
            accessorKey: 'matchStatus',
            header: '3-Way Match',
            cell: ({ row }) => {
                const status = row.original.matchStatus || 'Pending';
                let color = 'text-gray-500';
                if (status === 'Matched') color = 'text-green-600';
                if (status === 'Mismatch') color = 'text-red-600';
                return <span className={color}>{status}</span>;
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const bill = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        {bill.status !== 'Paid' && (
                            <Link to={`/purchase/payments/new?billId=${bill.id}`}>
                                <Button variant="outline" size="sm">Pay</Button>
                            </Link>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Bills</h2>
                <Link to="/purchase/bills/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Bill
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={bills} searchKey="vendorName" />
            )}
        </div>
    );
}
