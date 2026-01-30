import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeliveryChallans, approveDeliveryChallan, type DeliveryChallan } from "@/api/sales";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DeliveryChallansPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: challans = [], isLoading } = useQuery({
        queryKey: ["deliverychallans"],
        queryFn: getDeliveryChallans,
    });

    const approveMutation = useMutation({
        mutationFn: approveDeliveryChallan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deliverychallans"] });
        },
    });

    const columns: ColumnDef<DeliveryChallan>[] = [
        {
            accessorKey: "challanNumber",
            header: "Challan #",
        },
        {
            accessorKey: "challanDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.challanDate), "dd/MM/yyyy"),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                    ${row.original.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        row.original.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            row.original.status === 'In-Transit' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                    {row.original.status}
                </span>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const challan = row.original;
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
                            {challan.status === 'Draft' && (
                                <DropdownMenuItem onClick={() => approveMutation.mutate(challan.id)}>
                                    Approve & Dispatch
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate(`/sales/invoices/new?deliveryChallanId=${challan.id}`)}>
                                Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(challan.challanNumber)}>
                                Copy Challan Number
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
                    <h2 className="text-3xl font-bold tracking-tight">Delivery Challans</h2>
                    <p className="text-muted-foreground">Manage delivery challans and shipments.</p>
                </div>
                <Link to="/sales/delivery-challans/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Challan
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={challans} searchKey="customerName" />
            )}
        </div>
    );
}
