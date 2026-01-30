import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeliveryChallans, type DeliveryChallan } from "@/api/sales";
import type { ColumnDef } from "@tanstack/react-table"; // Fixed type import

export default function DeliveryChallanList() {
    const navigate = useNavigate();

    const { data: challans = [], isLoading } = useQuery({
        queryKey: ["delivery-challans"],
        queryFn: getDeliveryChallans,
    });

    const columns: ColumnDef<DeliveryChallan>[] = [
        {
            accessorKey: "challanNumber",
            header: "Challan #",
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.challanDate), "dd MMM yyyy"),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
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
                    <CardTitle>Delivery Challans</CardTitle>
                    <Button onClick={() => navigate("/sales/delivery-challans/new")}>
                        <Plus className="mr-2 h-4 w-4" /> Create Challan
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={challans} onRowClick={(row) => navigate(`/sales/delivery-challans/${row.id}`)} />
                </CardContent>
            </Card>
        </div>
    );
}
