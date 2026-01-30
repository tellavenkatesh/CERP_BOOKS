import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCashFlowStatement } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function CashFlowStatement() {
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: reportData, refetch, isFetching } = useQuery({
        queryKey: ["cash-flow", fromDate, toDate],
        queryFn: () => getCashFlowStatement(fromDate, toDate)
    });

    const handleExport = () => {
        if (!reportData) return;
        const data = [
            ...reportData.operatingActivities.map(x => ({ Activity: "Operating", Description: x.description, Amount: x.amount })),
            ...reportData.investingActivities.map(x => ({ Activity: "Investing", Description: x.description, Amount: x.amount })),
            ...reportData.financingActivities.map(x => ({ Activity: "Financing", Description: x.description, Amount: x.amount })),
            { Activity: "Net Cash Flow", Description: "-", Amount: reportData.netCashFlow }
        ];
        exportToCSV(data, `CashFlow_${fromDate}_${toDate}`);
    };

    const renderSection = (title: string, items: { description: string; amount: number }[]) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td className="py-2 text-muted-foreground">No activities recorded</td></tr>
                        ) : (
                            items.map((item, i) => (
                                <tr key={i} className="border-b hover:bg-muted/20">
                                    <td className="py-2">{item.description}</td>
                                    <td className="text-right py-2">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))
                        )}
                        <tr className="bg-muted font-bold">
                            <td className="py-2">Net {title}</td>
                            <td className="text-right py-2">
                                {items.reduce((sum, i) => sum + i.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Cash Flow Statement (Indirect Method)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                        </div>
                        <Button onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            {isFetching ? "Running..." : "Run Report"}
                        </Button>
                        <Button variant="outline" onClick={handleExport} disabled={!reportData}>
                            <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {reportData && (
                <div className="grid grid-cols-1 gap-6">
                    {renderSection("Operating Activities", reportData.operatingActivities)}
                    {renderSection("Investing Activities", reportData.investingActivities)}
                    {renderSection("Financing Activities", reportData.financingActivities)}

                    <Card className={reportData.netCashFlow >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Net Cash Flow</h3>
                                <span className="text-xl font-bold">{reportData.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
