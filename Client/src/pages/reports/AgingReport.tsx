import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAgingReport } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function AgingReport() {
    const location = useLocation();
    const [asOfDate, setAsOfDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [type, setType] = useState<"Receivable" | "Payable">("Receivable");

    // Auto-switch based on URL
    useEffect(() => {
        if (location.pathname.includes("payables")) {
            setType("Payable");
        } else if (location.pathname.includes("receivables")) {
            setType("Receivable");
        }
    }, [location.pathname]);

    const { data: entries = [], refetch, isFetching } = useQuery({
        queryKey: ["aging-report", type, asOfDate],
        queryFn: () => getAgingReport(type, asOfDate)
    });

    const totalDue = entries.reduce((sum, e) => sum + e.totalDue, 0);

    const handleExport = () => {
        if (entries.length === 0) return;
        const data = entries.map(e => ({
            "Party Name": e.partyName,
            "Current": e.buckets.find(b => b.range === "Current")?.amount || 0,
            "1-30 Days": e.buckets.find(b => b.range === "1-30")?.amount || 0,
            "31-60 Days": e.buckets.find(b => b.range === "31-60")?.amount || 0,
            "61-90 Days": e.buckets.find(b => b.range === "61-90")?.amount || 0,
            "90+ Days": e.buckets.find(b => b.range === "90+")?.amount || 0,
            "Total Due": e.totalDue
        }));
        exportToCSV(data, `Aging_${type}_${asOfDate}`);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Aging Report: {type === "Receivable" ? "Accounts Receivable" : "Accounts Payable"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="w-[200px]">
                            <label className="text-sm font-medium mb-1 block">Report Type</label>
                            <Select value={type} onValueChange={(val) => setType(val as "Receivable" | "Payable")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Receivable">Receivable (Customers)</SelectItem>
                                    <SelectItem value="Payable">Payable (Vendors)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">As Of</label>
                            <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
                        </div>
                        <Button onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            {isFetching ? "Running..." : "Run Report"}
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Aging Summary</CardTitle>
                    <p className="text-sm text-muted-foreground">Total Due: {totalDue.toFixed(2)}</p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Party Name</th>
                                    <th className="text-right py-2">Current</th>
                                    <th className="text-right py-2">1-30 Days</th>
                                    <th className="text-right py-2">31-60 Days</th>
                                    <th className="text-right py-2">61-90 Days</th>
                                    <th className="text-right py-2">90+ Days</th>
                                    <th className="text-right py-2">Total Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-4">No data found</td></tr>
                                ) : (
                                    entries.map((line, i) => {
                                        const current = line.buckets.find(b => b.range === "Current")?.amount || 0;
                                        const days30 = line.buckets.find(b => b.range === "1-30")?.amount || 0;
                                        const days60 = line.buckets.find(b => b.range === "31-60")?.amount || 0;
                                        const days90 = line.buckets.find(b => b.range === "61-90")?.amount || 0;
                                        const days90plus = line.buckets.find(b => b.range === "90+")?.amount || 0;

                                        return (
                                            <tr key={i} className="border-b hover:bg-muted/20">
                                                <td className="py-2 font-medium">{line.partyName}</td>
                                                <td className="text-right py-2">{current > 0 ? current.toFixed(2) : "-"}</td>
                                                <td className="text-right py-2">{days30 > 0 ? days30.toFixed(2) : "-"}</td>
                                                <td className="text-right py-2">{days60 > 0 ? days60.toFixed(2) : "-"}</td>
                                                <td className="text-right py-2">{days90 > 0 ? days90.toFixed(2) : "-"}</td>
                                                <td className="text-right py-2">{days90plus > 0 ? days90plus.toFixed(2) : "-"}</td>
                                                <td className="text-right py-2 font-bold">{line.totalDue.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
