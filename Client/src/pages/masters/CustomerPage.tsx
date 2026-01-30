import { useQuery } from '@tanstack/react-query';
import { getParties, type Party } from '@/api/masters';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function CustomerPage() {
    const { data: allParties = [], isLoading } = useQuery({
        queryKey: ['parties'],
        queryFn: getParties,
    });

    const customers = allParties
        .filter(p => p.type === 0)
        .sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));

    const columns: ColumnDef<Party>[] = [
        {
            accessorKey: 'displayName',
            header: 'NAME',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-blue-600">{row.original.displayName}</div>
                    <div className="text-xs text-muted-foreground">{row.original.companyName || row.original.name}</div>
                </div>
            )
        },
        {
            accessorKey: 'companyName',
            header: 'COMPANY NAME',
            cell: ({ row }) => row.original.companyName || '-'
        },
        {
            accessorKey: 'email',
            header: 'EMAIL',
        },
        {
            accessorKey: 'workPhone',
            header: 'WORK PHONE',
            cell: ({ row }) => row.original.phone || '-'
        },
        {
            accessorKey: 'receivables',
            header: 'RECEIVABLES',
            cell: ({ row }) => {
                const val = row.original.openingBalance || 0; // In reality this should normally be OpBal + Invoices - Payments. For now using OpeningBalance as proxy or if API returns calculated field.
                // Assuming Opening Balance is the only data we have for now in this view model.
                return (
                    <span className="font-medium">
                        {val.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                );
            }
        },
        {
            accessorKey: 'unusedCredits',
            header: 'UNUSED CREDITS',
            cell: () => <span>₹0.00</span> // Placeholder for now
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const party = row.original;
                return (
                    <div className="flex justify-end">
                        <Link to={`/masters/customers/${party.id}`}>
                            <Button variant="ghost" size="sm">
                                Edit
                            </Button>
                        </Link>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">All Customers</h2>
                    <p className="text-muted-foreground text-sm">Manage your customers and their details.</p>
                </div>

                <Link to="/masters/customers/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={customers} searchKey="displayName" />
            )}
        </div>
    );
}
