import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCreditNotes, type CreditNote } from "@/api/sales";
import type { ColumnDef } from "@tanstack/react-table";

export default function CreditNoteList() {
    const navigate = useNavigate();

    const { data: creditNotes = [], isLoading } = useQuery({
        queryKey: ["credit-notes"],
        queryFn: getCreditNotes,
    });

    const columns: ColumnDef<CreditNote>[] = [
        {
            accessorKey: "creditNoteNumber",
            header: "CN #",
        },
        {
            accessorKey: "creditNoteDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.creditNoteDate), "dd MMM yyyy"),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => row.original.totalAmount.toFixed(2),
        },
        {
            accessorKey: "status",
            header: "Status",
        },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Credit Notes</CardTitle>
                    <Button onClick={() => navigate("/sales/credit-notes/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Create Credit Note
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={creditNotes} onRowClick={(row) => navigate(`/sales/credit-notes/${row.id}`)} />
                </CardContent>
            </Card>
        </div>
    );
}
