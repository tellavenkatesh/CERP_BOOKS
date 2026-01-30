import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContraEntries, type ContraEntry } from "@/api/financial";
import type { ColumnDef } from "@tanstack/react-table";

export default function ContraEntryList() {
    const navigate = useNavigate();

    const { data: entries = [], isLoading } = useQuery({
        queryKey: ["contra-entries"],
        queryFn: getContraEntries,
    });

    const columns: ColumnDef<ContraEntry>[] = [
        {
            accessorKey: "contraNumber",
            header: "Contra #",
        },
        {
            accessorKey: "contraDate",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.contraDate), "dd MMM yyyy"),
        },
        {
            accessorKey: "description",
            header: "Description",
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
                    <CardTitle>Contra Entries</CardTitle>
                    <Button onClick={() => navigate("/financial/contra/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Create Contra Entry
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={entries} onRowClick={(row) => navigate(`/financial/contra/${row.id}`)} />
                </CardContent>
            </Card>
        </div>
    );
}
