import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPLStatement } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function ProfitAndLossReport() {
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: reportData, refetch, isFetching } = useQuery({
        queryKey: ["pl-report", fromDate, toDate],
        queryFn: () => getPLStatement(fromDate, toDate)
    });

    const handleExport = () => {
        if (!reportData) return;
        const data = [
            ...reportData.incomeAccounts.map(x => ({ Type: "Income", Account: x.accountName, Amount: x.amount })),
            ...reportData.expenseAccounts.map(x => ({ Type: "Expense", Account: x.accountName, Amount: x.amount })),
            { Type: "Total", Account: "Net Profit", Amount: reportData.netProfit }
        ];
        exportToCSV(data, `ProfitLoss_${fromDate}_${toDate}`);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Profit & Loss Statement</CardTitle>
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
                    <Card>
                        <CardHeader><CardTitle>Income</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <tbody>
                                    {reportData.incomeAccounts.map((acc, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{acc.accountName}</td>
                                            <td className="text-right py-2">{acc.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-muted font-bold">
                                        <td className="py-2">Total Income</td>
                                        <td className="text-right py-2">{reportData.totalIncome.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <tbody>
                                    {reportData.expenseAccounts.map((acc, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{acc.accountName}</td>
                                            <td className="text-right py-2">{acc.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-muted font-bold">
                                        <td className="py-2">Total Expenses</td>
                                        <td className="text-right py-2">{reportData.totalExpense.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card className={reportData.netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Net Profit</h3>
                                <span className="text-xl font-bold">{reportData.netProfit.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
