import { useQuery } from '@tanstack/react-query';
import { getParties, type Party } from '@/api/masters';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function VendorPage() {
    const navigate = useNavigate();

    const { data: allParties = [], isLoading } = useQuery({
        queryKey: ['parties'],
        queryFn: getParties,
    });

    // Filter for Vendors (Type 1)
    const vendors = allParties
        .filter(p => p.type === 1)
        .sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));

    const columns: ColumnDef<Party>[] = [
        {
            accessorKey: 'displayName',
            header: 'Vendor Name',
            cell: ({ row }) => (
                <div className="font-medium hover:underline cursor-pointer text-blue-600" onClick={() => navigate(`/masters/vendors/${row.original.id}`)}>
                    {row.original.displayName || row.original.name}
                </div>
            )
        },
        { accessorKey: 'companyName', header: 'Company Name' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'mobile', header: 'Mobile' },
        { accessorKey: 'gstIn', header: 'GSTIN' },
        {
            accessorKey: 'openingBalance',
            header: 'Outstanding Balance',
            cell: ({ row }) => {
                const val = row.original.openingBalance || 0;
                return (
                    <span className={val < 0 ? 'text-red-500' : 'text-green-600'}>
                        {val.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/masters/vendors/${row.original.id}`)}>Edit</Button>
            )
        }
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vendor Master</h2>
                    <p className="text-muted-foreground">Manage your vendors and suppliers.</p>
                </div>
                <Button onClick={() => navigate('/masters/vendors/new')}>
                    <Plus className="mr-2 h-4 w-4" /> New Vendor
                </Button>
            </div>

            {isLoading ? <div>Loading...</div> : <DataTable columns={columns} data={vendors} searchKey="displayName" />}
        </div>
    );
}
