import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { getPaymentTerms, type PaymentTerm } from "@/api/masters";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const columns: ColumnDef<PaymentTerm>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "days",
        header: "Days",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <span
                className={`px-2 py-1 rounded-full text-xs ${row.original.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
            >
                {row.original.isActive ? "Active" : "Inactive"}
            </span>
        ),
    },
];

export default function PaymentTermList() {
    const { data: paymentTerms, isLoading } = useQuery({
        queryKey: ["paymentTerms"],
        queryFn: getPaymentTerms,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Payment Terms</h2>
                <Button asChild>
                    <Link to="/admin/payment-terms/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Payment Term
                    </Link>
                </Button>
            </div>
            <DataTable columns={columns} data={paymentTerms || []} />
        </div>
    );
}
