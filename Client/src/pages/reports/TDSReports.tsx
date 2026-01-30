import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTDSReport, getTDSPayableReport, getTDSQuarterlyReport } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function TDSReports() {
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Query 1: Deducted
    const { data: deductedEntries = [], refetch: refetchDeducted, isFetching: isFetchingDeducted } = useQuery({
        queryKey: ["tds-report", fromDate, toDate],
        queryFn: () => getTDSReport(fromDate, toDate)
    });

    // Query 2: Payable
    const { data: payableEntries = [], refetch: refetchPayable, isFetching: isFetchingPayable } = useQuery({
        queryKey: ["tds-payable-report"],
        queryFn: () => getTDSPayableReport(fromDate, toDate)
    });

    // Query 3: Quarterly (Mock Quarter)
    const { data: quarterlyEntries = [], refetch: refetchQuarterly, isFetching: isFetchingQuarterly } = useQuery({
        queryKey: ["tds-quarterly-report"],
        queryFn: () => getTDSQuarterlyReport("Q4 FY 23-24")
    });

    const totalTDS = deductedEntries.reduce((sum, entry) => sum + entry.tdsDeducted, 0);

    const handleExport = () => {
        // Export logic prioritizing the active tab's data is complex without tab state tracking.
        // For simplicity, we'll export the Deducted Register as it's the primary report, or Payable if available.
        // A better UX would be to track the active tab. Assuming 'deducted' is default/primary.

        if (deductedEntries.length > 0) {
            const data = deductedEntries.map(d => ({
                Section: d.section,
                Party: d.partyName,
                "Payment Amount": d.paymentAmount,
                "Rate %": d.tdsRate,
                "TDS Deducted": d.tdsDeducted,
                Date: format(new Date(d.paymentDate), "yyyy-MM-dd")
            }));
            exportToCSV(data, `TDS_Deducted_${fromDate}_${toDate}`);
        } else if ((payableEntries as any[]).length > 0) {
            const data = (payableEntries as any[]).map(p => ({
                Section: p.section,
                "Total Payments": p.totalAmountPaid,
                "TDS Deducted": p.totalTdsDeducted,
                "Deposited": p.tdsDeposited,
                "Balance Payable": p.balancePayable
            }));
            exportToCSV(data, `TDS_Payable`);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Tax Report: TDS Analysis</CardTitle>
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

            <Tabs defaultValue="deducted" className="w-full">
                <TabsList>
                    <TabsTrigger value="deducted">TDS Deducted Register</TabsTrigger>
                    <TabsTrigger value="payable">TDS Payable Summary</TabsTrigger>
                    <TabsTrigger value="quarterly">Quarterly Returns</TabsTrigger>
                </TabsList>

                {/* Tab 1: Deducted */}
                <TabsContent value="deducted">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>TDS Deducted</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchDeducted()}><RefreshCcw className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Section</th>
                                        <th className="text-left py-2">Party Name</th>
                                        <th className="text-right py-2">Payment Amt</th>
                                        <th className="text-right py-2">Rate %</th>
                                        <th className="text-right py-2">TDS Deducted</th>
                                        <th className="text-right py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deductedEntries.map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2">{item.section}</td>
                                            <td className="py-2">{item.partyName}</td>
                                            <td className="text-right py-2">{item.paymentAmount.toLocaleString()}</td>
                                            <td className="text-right py-2">{item.tdsRate}%</td>
                                            <td className="text-right py-2">{item.tdsDeducted.toLocaleString()}</td>
                                            <td className="text-right py-2">{format(new Date(item.paymentDate), "dd-MMM-yyyy")}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-bold bg-muted">
                                        <td colSpan={4} className="py-2 pl-2">Total TDS Deducted</td>
                                        <td className="text-right py-2">{totalTDS.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Payable */}
                <TabsContent value="payable">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>TDS Payable (To Govt)</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchPayable()}><RefreshCcw className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Section</th>
                                        <th className="text-right py-2">Total Payments</th>
                                        <th className="text-right py-2">Total TDS Deducted</th>
                                        <th className="text-right py-2 text-green-600">Deposited</th>
                                        <th className="text-right py-2 text-red-600">Balance Payable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(payableEntries as any[]).map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2 font-medium">{item.section}</td>
                                            <td className="text-right py-2">{item.totalAmountPaid.toLocaleString()}</td>
                                            <td className="text-right py-2">{item.totalTdsDeducted.toLocaleString()}</td>
                                            <td className="text-right py-2 text-green-600">{item.tdsDeposited.toLocaleString()}</td>
                                            <td className="text-right py-2 text-red-600 font-bold">{item.balancePayable.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Quarterly */}
                <TabsContent value="quarterly">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Quarterly Returns Status</CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => refetchQuarterly()}><RefreshCcw className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Quarter</th>
                                        <th className="text-left py-2">Form</th>
                                        <th className="text-left py-2">Status</th>
                                        <th className="text-left py-2">Ack No</th>
                                        <th className="text-right py-2">Filing Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quarterlyEntries.map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2">{item.quarter}</td>
                                            <td className="py-2">{item.formType}</td>
                                            <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{item.status}</span></td>
                                            <td className="py-2">{item.acknowledgmentNo}</td>
                                            <td className="text-right py-2">{item.dateFiled}</td>
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
