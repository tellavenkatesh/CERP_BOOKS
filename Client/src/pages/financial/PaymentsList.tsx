import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getPayments, PaymentMode } from "@/api/financial";
import { type ColumnDef } from "@tanstack/react-table";
import { type Payment } from "@/api/financial";

const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "paymentNumber",
        header: "Payment #",
    },
    {
        accessorKey: "paymentDate",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("paymentDate")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "vendorName",
        header: "Vendor",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);
        },
    },
    {
        accessorKey: "paymentMode",
        header: "Mode",
        cell: ({ row }) => (PaymentMode as any)[row.getValue("paymentMode") as number],
    },
    {
        accessorKey: "referenceNumber",
        header: "Reference",
    },
];

export default function PaymentsList() {
    const { data: payments = [], isLoading } = useQuery({
        queryKey: ["payments"],
        queryFn: getPayments,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Payments</h1>
                <Link to="/financial/payments/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Payment
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={payments} />
        </div>
    );
}
