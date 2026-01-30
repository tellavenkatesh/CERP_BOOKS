import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEstimates, approveEstimate, sendEstimate, type EstimateDto } from "@/api/sales";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ChevronDown, Filter, Search, MoreHorizontal, Edit, Send } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EstimatesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: estimates = [], isLoading } = useQuery({
        queryKey: ["estimates"],
        queryFn: getEstimates,
    });

    const approveMutation = useMutation({
        mutationFn: approveEstimate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["estimates"] });
        },
    });

    const sendMutation = useMutation({
        mutationFn: sendEstimate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["estimates"] });
        }
    });

    const columns: ColumnDef<EstimateDto>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "estimateDate",
            header: "DATE",
            cell: ({ row }) => <span className="text-gray-700 font-medium">{format(new Date(row.original.estimateDate), "dd MMM yyyy")}</span>,
        },
        {
            accessorKey: "estimateNumber",
            header: "ESTIMATE NUMBER",
            cell: ({ row }) => (
                <Link to={`/sales/estimates/${row.original.id}`} className="text-blue-600 hover:underline">
                    {row.original.estimateNumber}
                </Link>
            ),
        },
        {
            accessorKey: "referenceNumber",
            header: "REFERENCE NUMBER",
            cell: ({ row }) => <span className="text-gray-700">{row.original.referenceNumber || '-'}</span>
        },
        {
            accessorKey: "customerName",
            header: "CUSTOMER NAME",
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.customerName}</span>,
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => {
                const status = row.original.status.toUpperCase();
                let colorClass = "text-gray-500";
                if (status === "SENT") colorClass = "text-blue-600";
                if (status === "ACCEPTED") colorClass = "text-green-600";
                if (status === "EXPIRED") colorClass = "text-red-500";

                return (
                    <span className={`text-xs font-semibold ${colorClass}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            accessorKey: "totalAmount",
            header: "AMOUNT",
            cell: ({ row }) => (
                <div className="font-semibold text-gray-900">
                    {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                    }).format(row.original.totalAmount)}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
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
                            <DropdownMenuItem onClick={() => navigate(`/sales/estimates/${row.original.id}`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendMutation.mutate(row.original.id)}>
                                <Send className="mr-2 h-4 w-4" /> Send
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <h2 className="text-xl font-semibold text-gray-800">All Estimates</h2>
                    <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-800 transition-colors" />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/sales/estimates/new')}>
                        <Plus className="h-4 w-4 mr-1" /> New
                    </Button>
                    <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-orange-500">
                        ?
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 bg-gray-50/50">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={estimates}
                        searchKey="customerName"
                    // We might need to style the table header to be uppercase/gray within DataTable or pass styling
                    />
                )}
            </div>
        </div>
    );
}


