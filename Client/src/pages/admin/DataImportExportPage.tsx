import { useState } from "react";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { importData, exportData } from "@/api/admin";

export default function DataImportExportPage() {
    const [importType, setImportType] = useState("COA");
    const [exportType, setExportType] = useState("All");
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        setLoading(true);
        try {
            // Simulate file picking by passing a dummy file
            const dummyFile = new File(["content"], "data.csv", { type: "text/csv" });
            const result = await importData(importType, dummyFile);
            alert(result.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            await exportData(exportType);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Data Import / Export</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* IMPORT SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-600" /> Import Data
                        </CardTitle>
                        <CardDescription>
                            Bulk import masters and transactions from CSV/Excel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Data Type</label>
                            <Select value={importType} onValueChange={setImportType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COA">Chart of Accounts</SelectItem>
                                    <SelectItem value="Customers">Customers / Vendors</SelectItem>
                                    <SelectItem value="Items">Items / Products</SelectItem>
                                    <SelectItem value="Opening">Opening Balances</SelectItem>
                                    <SelectItem value="Transactions">Transactions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center">
                            <FileSpreadsheet className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">Drag and drop file here or click to browse</p>
                            <Button variant="secondary" onClick={handleImport} disabled={loading}>
                                {loading ? "Importing..." : "Select File & Import"}
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            <p>Supported formats: .csv, .xlsx</p>
                            <a href="#" className="underline text-blue-600">Download Template</a>
                        </div>
                    </CardContent>
                </Card>

                {/* EXPORT SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-green-600" /> Export Data
                        </CardTitle>
                        <CardDescription>
                            Export system data for backup or analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Data to Export</label>
                            <Select value={exportType} onValueChange={setExportType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Data (Full Dump)</SelectItem>
                                    <SelectItem value="Masters">All Masters Only</SelectItem>
                                    <SelectItem value="Transactions">All Transactions Only</SelectItem>
                                    <SelectItem value="Ledgers">General Ledger Entries</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full" variant="outline" onClick={handleExport} disabled={loading}>
                                {loading ? "Exporting..." : "Download Export"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
