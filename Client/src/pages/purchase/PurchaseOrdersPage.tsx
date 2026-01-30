import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseOrders, approvePurchaseOrder, sendPurchaseOrder, type PurchaseOrderDto } from '@/api/purchase';
import { DataTable } from '@/components/ui/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function PurchaseOrdersPage() {
    const { data: purchaseOrders = [], isLoading } = useQuery({
        queryKey: ['purchaseOrders'],
        queryFn: getPurchaseOrders,
    });

    const queryClient = useQueryClient();
    const approveMutation = useMutation({
        mutationFn: approvePurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
        }
    });

    const sendMutation = useMutation({
        mutationFn: sendPurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
        }
    });

    const columns: ColumnDef<PurchaseOrderDto>[] = [
        {
            accessorKey: 'orderNumber',
            header: 'Order #',
        },
        {
            accessorKey: 'orderDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.orderDate), 'dd/MM/yyyy'),
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
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex gap-2 items-center">
                    <span className="capitalize">{row.original.status}</span>
                    {row.original.approvalStatus === 1 && <span className="text-xs text-green-600 border border-green-600 px-1 rounded">Approved</span>}
                </div>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const po = row.original;
                return (
                    <div className="flex gap-2 justify-end">
                        {/* Edit Action - Always visible as per request */}
                        <Link to={`/purchase/orders/new?editId=${po.id}`}>
                            <Button size="sm" variant="outline">
                                Edit
                            </Button>
                        </Link>

                        {/* Approval Action */}
                        {po.approvalStatus === 0 && (
                            <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(po.id)}>
                                Approve
                            </Button>
                        )}

                        {/* Send Action (Only if Approved and Draft) */}
                        {po.approvalStatus === 1 && po.status === 'Draft' && (
                            <Button size="sm" variant="outline" onClick={() => sendMutation.mutate(po.id)}>
                                Send
                            </Button>
                        )}

                        {/* Create GRN (Only if Sent or PartiallyReceived) */}
                        {(po.status === 'Sent' || po.status === 'PartiallyReceived') && (
                            <Link to={`/purchase/grns/new?poId=${po.id}`}>
                                <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700">
                                    Create GRN
                                </Button>
                            </Link>
                        )}
                    </div>
                )
            }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                <Link to="/purchase/orders/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create PO
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={purchaseOrders} searchKey="vendorName" />
            )}
        </div>
    );
}


