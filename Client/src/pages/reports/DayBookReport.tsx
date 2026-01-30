import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDayBook } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function DayBookReport() {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const { data: entries = [], refetch, isFetching } = useQuery({
        queryKey: ["day-book", date],
        queryFn: () => getDayBook(date)
    });

    const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

    const handleExport = () => {
        if (entries.length === 0) return;
        exportToCSV(entries, `DayBook_${date}`);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Day Book Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Select Date</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <Button onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            {isFetching ? "Running..." : "Run Report"}
                        </Button>
                        <Button variant="outline" onClick={handleExport} disabled={entries.length === 0}>
                            <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transactions for {format(new Date(date), "dd MMM yyyy")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Voucher No</th>
                                    <th className="text-left py-2">Type</th>
                                    <th className="text-left py-2">Account</th>
                                    <th className="text-left py-2">Narration</th>
                                    <th className="text-right py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-4">No transactions found</td></tr>
                                ) : (
                                    entries.map((entry, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{entry.voucherNo}</td>
                                            <td className="py-2">{entry.voucherType}</td>
                                            <td className="py-2">{entry.account}</td>
                                            <td className="py-2">{entry.narration}</td>
                                            <td className="text-right py-2">{entry.amount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                                <tr className="bg-muted font-bold">
                                    <td colSpan={4} className="py-2 text-right">Total</td>
                                    <td className="text-right py-2">{totalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
