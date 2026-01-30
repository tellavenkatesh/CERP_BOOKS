import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { getTaxCodes, type TaxCode } from "@/api/masters";

export default function TaxCodeList() {
    const navigate = useNavigate();
    const { data: taxCodes = [], isLoading } = useQuery({
        queryKey: ["taxCodes"],
        queryFn: getTaxCodes
    });

    const columns: ColumnDef<TaxCode>[] = [
        { accessorKey: "code", header: "Code" },
        { accessorKey: "name", header: "Name" },
        {
            accessorKey: "rate",
            header: "Rate (%)",
            cell: ({ row }) => <div className="text-right">{row.getValue<number>("rate").toFixed(2)}%</div>
        },
        {
            accessorKey: "taxType",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue<number>("taxType");
                switch (type) {
                    case 0: return "GST Output";
                    case 1: return "GST Input";
                    case 2: return "Sales Tax";
                    case 3: return "VAT";
                    case 4: return "Other";
                    default: return "Unknown";
                }
            }
        },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => row.original.isActive ? "Active" : "Inactive"
        },
    ];

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Tax Codes</h1>
                <Button onClick={() => navigate("/admin/tax-codes/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Tax Code
                </Button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={taxCodes} />
            )}
        </div>
    );
}
