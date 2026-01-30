import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSalesOrders, approveSalesOrder, type SalesOrderDto } from "@/api/sales";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SalesOrdersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["salesorders"],
        queryFn: getSalesOrders,
    });

    const approveMutation = useMutation({
        mutationFn: approveSalesOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salesorders"] });
        },
    });

    const columns: ColumnDef<SalesOrderDto>[] = [
        {
            accessorKey: "orderNumber",
            header: "Order #",
        },
        {
            accessorKey: "orderDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.orderDate), "dd/MM/yyyy"),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
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
                        row.original.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            row.original.status === 'FullyDelivered' ? 'bg-purple-100 text-purple-800' :
                                row.original.status === 'FullyInvoiced' ? 'bg-green-100 text-green-800' :
                                    row.original.status === 'Closed' ? 'bg-gray-800 text-white' :
                                        row.original.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                    {row.original.status}
                </span>
            )
        },

        {
            accessorKey: "approvalStatus",
            header: "Customer Status",
            cell: ({ row }) => {
                const so = row.original;
                if (so.approvalStatus === 'Approved') return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Approved</span>;
                if (so.approvalStatus === 'Rejected') return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Rejected</span>;
                if (so.sentAt) {
                    if (so.viewedAt) return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">Viewed</span>;
                    return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">Sent</span>;
                }
                return <span className="text-gray-400 text-xs">-</span>;
            }
        },
        {
            accessorKey: "fulfillment",
            header: "Fulfillment",
            cell: ({ row }) => {
                const items = row.original.items || [];
                const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
                const deliveredQty = items.reduce((sum, i) => i.quantityDelivered ? sum + i.quantityDelivered : sum, 0);
                const invoicedQty = items.reduce((sum, i) => i.quantityInvoiced ? sum + i.quantityInvoiced : sum, 0);

                const deliveredPct = totalQty > 0 ? (deliveredQty / totalQty) * 100 : 0;
                const invoicedPct = totalQty > 0 ? (invoicedQty / totalQty) * 100 : 0;

                return (
                    <div className="flex flex-col gap-1 w-32">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-12 text-muted-foreground">Delivered:</span>
                            <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${deliveredPct >= 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                                    style={{ width: `${Math.min(deliveredPct, 100)}%` }}
                                />
                            </div>
                            <span className="w-8 text-right">{Math.round(deliveredPct)}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-12 text-muted-foreground">Invoiced:</span>
                            <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${invoicedPct >= 100 ? 'bg-blue-500' : 'bg-blue-300'}`}
                                    style={{ width: `${Math.min(invoicedPct, 100)}%` }}
                                />
                            </div>
                            <span className="w-8 text-right">{Math.round(invoicedPct)}%</span>
                        </div>
                    </div>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const order = row.original;
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
                            {order.status !== 'Closed' && order.status !== 'Cancelled' && (
                                <DropdownMenuItem onClick={() => navigate(`/sales/orders/${order.id}`)}>
                                    Edit Order
                                </DropdownMenuItem>
                            )}
                            {order.status === 'Draft' && (
                                <DropdownMenuItem onClick={() => approveMutation.mutate(order.id)}>
                                    Approve Order
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => navigate(`/sales/delivery-challans/new?salesOrderId=${order.id}`)}
                            >
                                Create Delivery Challan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate(`/sales/invoices/new?salesOrderId=${order.id}`)}
                            >
                                Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.orderNumber)}>
                                Copy Order Number
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
                    <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
                    <p className="text-muted-foreground">Manage customer sales orders.</p>
                </div>
                <Link to="/sales/orders/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Order
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={orders} searchKey="customerName" />
            )}
        </div>
    );
}
