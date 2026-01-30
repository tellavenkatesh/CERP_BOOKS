import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getBalanceSheet } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

interface SectionProps {
    title: string;
    items: { accountName: string; amount: number }[];
    total: number;
}

export default function BalanceSheetReport() {
    const [asOfDate, setAsOfDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: reportData, refetch, isFetching } = useQuery({
        queryKey: ["balance-sheet", asOfDate],
        queryFn: () => getBalanceSheet(asOfDate)
    });

    const handleExport = () => {
        if (!reportData) return;
        const data = [
            ...reportData.assets.map(x => ({ Category: "Asset", Account: x.accountName, Amount: x.amount })),
            ...reportData.liabilities.map(x => ({ Category: "Liability", Account: x.accountName, Amount: x.amount })),
            ...reportData.equity.map(x => ({ Category: "Equity", Account: x.accountName, Amount: x.amount })),
        ];
        exportToCSV(data, `BalanceSheet_${asOfDate}`);
    };

    const renderSection = (title: string, items: { accountName: string; amount: number }[], total: number) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <table className="w-full text-sm">
                    <tbody>
                        {items.map((acc, i) => (
                            <tr key={i} className="border-b hover:bg-muted/20">
                                <td className="py-2">{acc.accountName}</td>
                                <td className="text-right py-2">{acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                        <tr className="bg-muted font-bold">
                            <td className="py-2">Total {title}</td>
                            <td className="text-right py-2">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
                    <CardTitle>Balance Sheet</CardTitle>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        {renderSection("Assets", reportData.assets, reportData.totalAssets)}
                    </div>
                    <div className="space-y-6">
                        {renderSection("Liabilities", reportData.liabilities, reportData.totalLiabilities)}
                        {renderSection("Equity", reportData.equity, reportData.totalEquity)}

                        <Card className="bg-primary/10 border-primary">
                            <CardContent className="pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Liabilities & Equity</span>
                                    <span>{(reportData.totalLiabilities + reportData.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
