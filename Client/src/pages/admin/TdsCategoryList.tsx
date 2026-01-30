import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { getTdsCategories, type TdsCategory } from "@/api/masters";

export default function TdsCategoryList() {
    const navigate = useNavigate();
    const { data: tdsCategories = [], isLoading } = useQuery({
        queryKey: ["tdsCategories"],
        queryFn: getTdsCategories
    });

    const columns: ColumnDef<TdsCategory>[] = [
        { accessorKey: "code", header: "Code" },
        { accessorKey: "name", header: "Name" },
        {
            accessorKey: "rate",
            header: "Rate (%)",
            cell: ({ row }) => <div className="text-right">{row.getValue<number>("rate").toFixed(2)}%</div>
        },
        {
            accessorKey: "thresholdAmount",
            header: "Threshold",
            cell: ({ row }) => <div className="text-right">{row.getValue<number>("thresholdAmount").toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
        },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => row.original.isActive ? "Active" : "Inactive"
        },
    ];

    return (
        <div className="container mx-auto py-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">TDS Categories</h1>
                    <p className="text-muted-foreground">Manage TDS categories and thresholds.</p>
                </div>

                <Button onClick={() => navigate("/admin/tds-categories/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Category
                </Button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={tdsCategories} searchKey="name" />
            )}
        </div>
    );
}
