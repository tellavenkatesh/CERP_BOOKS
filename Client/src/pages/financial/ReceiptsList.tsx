import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getReceipts, PaymentMode } from "@/api/financial";
import { type ColumnDef } from "@tanstack/react-table";
import { type Receipt } from "@/api/financial";

const columns: ColumnDef<Receipt>[] = [
    {
        accessorKey: "receiptNumber",
        header: "Receipt #",
    },
    {
        accessorKey: "receiptDate",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("receiptDate")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "customerName",
        header: "Customer",
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

export default function ReceiptsList() {
    const { data: receipts = [], isLoading } = useQuery({
        queryKey: ["receipts"],
        queryFn: getReceipts,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Receipts</h1>
                <Link to="/financial/receipts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Receipt
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={receipts} />
        </div>
    );
}
