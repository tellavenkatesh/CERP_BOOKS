import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGSTReport, getGST3BReport } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function GSTReports() {
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [activeTab, setActiveTab] = useState("gstr1");

    const { data: gstr1Entries = [], refetch: refetchGSTR1, isFetching: isFetchingGSTR1 } = useQuery({
        queryKey: ["gst-report", "GSTR1", fromDate, toDate],
        queryFn: () => getGSTReport("GSTR1", fromDate, toDate)
    });

    const { data: gstr2Entries = [], refetch: refetchGSTR2, isFetching: isFetchingGSTR2 } = useQuery({
        queryKey: ["gst-report", "GSTR2", fromDate, toDate],
        queryFn: () => getGSTReport("GSTR2", fromDate, toDate)
    });

    const { data: gstr3bEntries = [], refetch: refetchGSTR3B, isFetching: isFetchingGSTR3B } = useQuery({
        queryKey: ["gst-3b-report"],
        queryFn: () => getGST3BReport("Current Month")
    });

    const handleExport = () => {
        if (activeTab === "gstr1" && gstr1Entries.length > 0) {
            exportToCSV(gstr1Entries, `GSTR1_${fromDate}_${toDate}`);
        } else if (activeTab === "gstr2" && gstr2Entries.length > 0) {
            exportToCSV(gstr2Entries, `GSTR2_${fromDate}_${toDate}`);
        } else if (activeTab === "gstr3b" && gstr3bEntries.length > 0) {
            exportToCSV(gstr3bEntries, `GSTR3B_Summary`);
        }
    };

    const renderGSTTable = (entries: any[]) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">GSTIN</th>
                        <th className="text-left py-2">Party Name</th>
                        <th className="text-left py-2">Invoice #</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Taxable Value</th>
                        <th className="text-right py-2">IGST</th>
                        <th className="text-right py-2">CGST</th>
                        <th className="text-right py-2">SGST</th>
                        <th className="text-right py-2">Total Tax</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.length === 0 ? (
                        <tr><td colSpan={9} className="text-center py-4">No data found</td></tr>
                    ) : (
                        entries.map((item, i) => (
                            <tr key={i} className="border-b hover:bg-muted/20">
                                <td className="py-2">{item.gstin}</td>
                                <td className="py-2">{item.partyName}</td>
                                <td className="py-2">{item.invoiceNo}</td>
                                <td className="py-2">{format(new Date(item.date), "dd-MMM-yyyy")}</td>
                                <td className="text-right py-2">{item.taxableValue.toFixed(2)}</td>
                                <td className="text-right py-2">{item.igst.toFixed(2)}</td>
                                <td className="text-right py-2">{item.cgst.toFixed(2)}</td>
                                <td className="text-right py-2">{item.sgst.toFixed(2)}</td>
                                <td className="text-right py-2 font-bold">{item.totalTax.toFixed(2)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Tax Report: GST Returns</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">From Date</label>
                            <input type="date" className="p-2 border rounded" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">To Date</label>
                            <input type="date" className="p-2 border rounded" value={toDate} onChange={e => setToDate(e.target.value)} />
                        </div>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="gstr1" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="gstr1">GSTR-1 (Sales)</TabsTrigger>
                    <TabsTrigger value="gstr2">GSTR-2 (Purchase)</TabsTrigger>
                    <TabsTrigger value="gstr3b">GSTR-3B & Payable</TabsTrigger>
                </TabsList>

                <TabsContent value="gstr1">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>GSTR-1: Outward Supplies</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchGSTR1()} disabled={isFetchingGSTR1}>
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>{renderGSTTable(gstr1Entries)}</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gstr2">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>GSTR-2: Inward Supplies</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchGSTR2()} disabled={isFetchingGSTR2}>
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>{renderGSTTable(gstr2Entries)}</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gstr3b">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>GSTR-3B Summary & Payable</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchGSTR3B()} disabled={isFetchingGSTR3B}>
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Category</th>
                                        <th className="text-right py-2">Taxable Value</th>
                                        <th className="text-right py-2">IGST</th>
                                        <th className="text-right py-2">CGST</th>
                                        <th className="text-right py-2">SGST</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gstr3bEntries.map((item, i) => (
                                        <tr key={i} className={`border-b ${item.category === 'Payable' ? 'bg-muted font-bold' : ''}`}>
                                            <td className="py-2">{item.category}</td>
                                            <td className="text-right py-2">{item.taxableValue.toLocaleString()}</td>
                                            <td className="text-right py-2">{item.igst.toLocaleString()}</td>
                                            <td className="text-right py-2">{item.cgst.toLocaleString()}</td>
                                            <td className="text-right py-2">{item.sgst.toLocaleString()}</td>
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
