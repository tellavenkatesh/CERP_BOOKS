import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGRNReport, getQualityRejectionReport, getThreeWayMatchReport } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function GRNReports() {
    const { data: entries = [], refetch, isFetching } = useQuery({
        queryKey: ["grn-report"],
        queryFn: getGRNReport
    });

    const { data: qcEntries = [], refetch: refetchQC } = useQuery({
        queryKey: ["quality-rejection"],
        queryFn: getQualityRejectionReport
    });

    const { data: threeWayEntries = [], refetch: refetchThreeWay } = useQuery({
        queryKey: ["three-way-match"],
        queryFn: getThreeWayMatchReport
    });

    const pendingCount = entries.filter(e => e.status === "Pending Bill").length;

    const handleExport = () => {
        if (entries.length === 0) return;
        const data = entries.map(e => ({
            "GRN #": e.grnNo,
            Date: format(new Date(e.date), "yyyy-MM-dd"),
            Vendor: e.vendorName,
            "PO #": e.poNo,
            Status: e.status
        }));
        exportToCSV(data, `GRN_Register`);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Good Received Note (GRN) Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <Button onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                {isFetching ? "Running..." : "Refresh Data"}
                            </Button>
                        </div>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="register" className="w-full">
                <TabsList>
                    <TabsTrigger value="register">GRN Register</TabsTrigger>
                    <TabsTrigger value="qc">Quality Rejections</TabsTrigger>
                    <TabsTrigger value="3way">3-Way Matching</TabsTrigger>
                </TabsList>

                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>GRN Register</CardTitle>
                            <p className="text-sm text-muted-foreground">Pending Billing: {pendingCount}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">GRN #</th>
                                            <th className="text-left py-2">Date</th>
                                            <th className="text-left py-2">Vendor</th>
                                            <th className="text-left py-2">PO #</th>
                                            <th className="text-right py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-4">No data found</td></tr>
                                        ) : (
                                            entries.map((item, i) => (
                                                <tr key={i} className="border-b hover:bg-muted/20">
                                                    <td className="py-2">{item.grnNo}</td>
                                                    <td className="py-2">{format(new Date(item.date), "dd-MMM-yyyy")}</td>
                                                    <td className="py-2">{item.vendorName}</td>
                                                    <td className="py-2">{item.poNo}</td>
                                                    <td className="text-right py-2 font-medium">
                                                        <span className={`px-2 py-1 rounded text-xs ${item.status === "Billed" ? "bg-green-100 text-green-800" :
                                                            "bg-amber-100 text-amber-800"
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="qc">
                    <Card>
                        <CardHeader><CardTitle>Quality Control Rejections</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">GRN #</th>
                                        <th className="text-left py-2">Item</th>
                                        <th className="text-right py-2">Rejected Qty</th>
                                        <th className="text-left py-2 pl-4">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {qcEntries.map((item, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{item.grnNo}</td>
                                            <td className="py-2">{item.itemName} <span className="text-xs text-muted-foreground">({item.itemCode})</span></td>
                                            <td className="text-right py-2 text-red-600 font-bold">{item.rejectedQty}</td>
                                            <td className="py-2 pl-4">{item.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="3way">
                    <Card>
                        <CardHeader><CardTitle>3-Way Match Exceptions (PO vs GRN vs Bill)</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">PO #</th>
                                        <th className="text-left py-2">GRN #</th>
                                        <th className="text-left py-2">Bill #</th>
                                        <th className="text-right py-2">PO Qty</th>
                                        <th className="text-right py-2">GRN Qty</th>
                                        <th className="text-right py-2">Bill Qty</th>
                                        <th className="text-right py-2">Status</th>
                                        <th className="text-left py-2 pl-4">Discrepancy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {threeWayEntries.map((item, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{item.poNo}</td>
                                            <td className="py-2">{item.grnNo}</td>
                                            <td className="py-2">{item.billNo}</td>
                                            <td className="text-right py-2">{item.poQty}</td>
                                            <td className="text-right py-2">{item.grnQty}</td>
                                            <td className="text-right py-2">{item.billQty}</td>
                                            <td className="text-right py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${item.status === "Matched" ? "bg-green-100 text-green-800" :
                                                    "bg-red-100 text-red-800"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-2 pl-4 text-red-600">{item.discrepancy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
