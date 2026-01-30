import { useQuery } from '@tanstack/react-query';
import { getGrns, type GrnDto } from '@/api/purchase';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function GrnPage() {
    const { data: grns = [], isLoading } = useQuery({
        queryKey: ['grns'],
        queryFn: getGrns,
    });

    const columns: ColumnDef<GrnDto>[] = [
        {
            accessorKey: 'grnNumber',
            header: 'GRN #',
        },
        {
            accessorKey: 'grnDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.grnDate), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'vendorName',
            header: 'Vendor',
        },
        {
            accessorKey: 'vendorInvoiceNumber',
            header: 'Vendor Inv #',
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Goods Receipt Notes</h2>
                <Link to="/purchase/grns/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create GRN
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={grns} searchKey="vendorName" />
            )}
        </div>
    );
}
