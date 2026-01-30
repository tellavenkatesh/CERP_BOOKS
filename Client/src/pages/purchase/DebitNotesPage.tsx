import { useQuery } from '@tanstack/react-query';
import { getDebitNotes, type DebitNote } from '@/api/purchase';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function DebitNotesPage() {
    const { data: debitNotes = [], isLoading } = useQuery({
        queryKey: ['debitNotes'],
        queryFn: getDebitNotes,
    });

    const columns: ColumnDef<DebitNote>[] = [
        {
            accessorKey: 'debitNoteNumber',
            header: 'DN #',
        },
        {
            accessorKey: 'debitNoteDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.debitNoteDate), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'vendorName',
            header: 'Vendor',
        },
        {
            accessorKey: 'totalAmount',
            header: 'Amount',
            cell: ({ row }) => row.original.totalAmount.toFixed(2),
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Debit Notes</h2>
                <Link to="/purchase/debit-notes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Debit Note
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={debitNotes} searchKey="vendorName" />
            )}
        </div>
    );
}
