import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { getNumberingSeries, type NumberingSeries } from "@/api/masters";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const columns: ColumnDef<NumberingSeries>[] = [
    {
        accessorKey: "entityName",
        header: "Entity",
    },
    {
        accessorKey: "prefix",
        header: "Prefix",
    },
    {
        accessorKey: "resetFrequency",
        header: "Reset",
        cell: ({ row }) => {
            const freq = row.original.resetFrequency;
            return freq === 1 ? "Yearly" : freq === 2 ? "Monthly" : "Never";
        },
    },
    {
        accessorKey: "lastUsedNumber",
        header: "Current No.",
    },
    {
        accessorKey: "preview",
        header: "Next No. Preview",
    },
    {
        accessorKey: "isDefault",
        header: "Default",
        cell: ({ row }) => (
            row.original.isDefault ? <span className="text-green-600 font-bold">Yes</span> : "No"
        ),
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

export default function NumberingSeriesList() {
    const { data: numberingSeries, isLoading } = useQuery({
        queryKey: ["numberingSeries"],
        queryFn: getNumberingSeries,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Numbering Series</h2>
                <Button asChild>
                    <Link to="/admin/numbering-series/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Series
                    </Link>
                </Button>
            </div>
            <DataTable columns={columns} data={numberingSeries || []} />
        </div>
    );
}
