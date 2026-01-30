import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTrialBalance } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function TrialBalanceReport() {
    const [asOfDate, setAsOfDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: reportData, refetch, isFetching } = useQuery({
        queryKey: ["trial-balance", asOfDate],
        queryFn: () => getTrialBalance(asOfDate)
    });

    const lines = reportData?.lines || [];

    const handleExport = () => {
        if (!reportData?.lines) return;
        exportToCSV(reportData.lines, `TrialBalance_${asOfDate}`);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Trial Balance Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">As Of Date</label>
                            <Input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} />
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
                <Card>
                    <CardHeader>
                        <CardTitle>Trial Balance as of {format(new Date(asOfDate), "dd MMM yyyy")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Account Code</th>
                                    <th className="text-left py-2">Account Name</th>
                                    <th className="text-right py-2">Debit</th>
                                    <th className="text-right py-2">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line, i) => (
                                    <tr key={i} className="border-b hover:bg-muted/20">
                                        <td className="py-2">{line.accountCode}</td>
                                        <td className="py-2">{line.accountName}</td>
                                        <td className="text-right py-2">{line.debit !== 0 ? line.debit.toFixed(2) : ""}</td>
                                        <td className="text-right py-2">{line.credit !== 0 ? line.credit.toFixed(2) : ""}</td>
                                    </tr>
                                ))}
                                <tr className="bg-muted font-bold">
                                    <td colSpan={2} className="py-2 text-right">Total</td>
                                    <td className="text-right py-2">{reportData.totalDebit.toFixed(2)}</td>
                                    <td className="text-right py-2">{reportData.totalCredit.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
