import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getLedgerReport } from "@/api/reports";
import { getAccounts } from "@/api/masters";
import { exportToCSV } from "@/utils/exportToCSV";

export default function LedgerReport() {
    const { id } = useParams<{ id: string }>();
    const [accountId, setAccountId] = useState(id || "");
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [includeOpening, setIncludeOpening] = useState(true);

    // Fetch Accounts for Dropdown
    const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
        queryKey: ["accounts"],
        queryFn: getAccounts,
    });

    const { data: reportData, refetch, isFetching } = useQuery({
        queryKey: ["ledger-report", accountId, fromDate, toDate],
        queryFn: () => getLedgerReport(accountId, fromDate, toDate),
        enabled: !!accountId
    });

    const handleExport = () => {
        if (!reportData?.transactions) return;

        const csvData = [];

        // Add Opening Balance Row if enabled
        if (includeOpening && reportData.openingBalance !== 0) {
            csvData.push({
                Date: format(new Date(fromDate), "yyyy-MM-dd"),
                "Voucher Type": "Opening",
                "Voucher No": "-",
                Particulars: "Opening Balance",
                Debit: reportData.openingBalance > 0 ? reportData.openingBalance.toFixed(2) : "",
                Credit: reportData.openingBalance < 0 ? Math.abs(reportData.openingBalance).toFixed(2) : "",
                Balance: reportData.openingBalance.toFixed(2)
            });
        }

        // Add Transactions
        reportData.transactions.forEach(t => {
            csvData.push({
                Date: format(new Date(t.date), "yyyy-MM-dd"),
                "Voucher Type": t.voucherType,
                "Voucher No": t.voucherNumber,
                Particulars: t.description,
                Debit: t.debit > 0 ? t.debit.toFixed(2) : "",
                Credit: t.credit > 0 ? t.credit.toFixed(2) : "",
                Balance: t.runningBalance.toFixed(2)
            });
        });

        // Add Closing Balance Row
        csvData.push({
            Date: format(new Date(toDate), "yyyy-MM-dd"),
            "Voucher Type": "Closing",
            "Voucher No": "-",
            Particulars: "Closing Balance",
            Debit: "",
            Credit: "",
            Balance: reportData.closingBalance.toFixed(2)
        });

        exportToCSV(csvData, `Ledger_${reportData.accountName}_${fromDate}_${toDate}`);
    };

    const transactions = reportData?.transactions || [];
    const showOpeningRow = includeOpening && reportData && reportData.openingBalance !== 0;

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>General Ledger Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex flex-col gap-2 w-full md:w-auto flex-1 min-w-[250px]">
                                <Label>Account</Label>
                                <Select value={accountId} onValueChange={setAccountId} disabled={isLoadingAccounts}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name} ({acc.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>From Date</Label>
                                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>To Date</Label>
                                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                            </div>
                            <Button onClick={() => refetch()} disabled={isFetching || !accountId}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                {isFetching ? "Running..." : "Run Report"}
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={!reportData}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center space-x-2 border rounded p-2 w-fit bg-muted/20">
                            <Switch
                                id="opening-balance-mode"
                                checked={includeOpening}
                                onCheckedChange={setIncludeOpening}
                            />
                            <Label htmlFor="opening-balance-mode">Include Opening Balance</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {reportData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ledger Statement: {reportData.accountName}</CardTitle>
                        <p className="text-sm text-muted-foreground">Period: {fromDate} to {toDate}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 p-2">Date</th>
                                        <th className="text-left py-2 p-2">Voucher Type</th>
                                        <th className="text-left py-2 p-2">Voucher #</th>
                                        <th className="text-left py-2 p-2 w-1/3">Particulars</th>
                                        <th className="text-right py-2 p-2">Debit</th>
                                        <th className="text-right py-2 p-2">Credit</th>
                                        <th className="text-right py-2 p-2">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {showOpeningRow && (
                                        <tr className="bg-muted/50 font-medium">
                                            <td className="py-2 p-2">{format(new Date(fromDate), "dd-MMM-yyyy")}</td>
                                            <td className="py-2 p-2">Opening</td>
                                            <td className="py-2 p-2">-</td>
                                            <td className="py-2 p-2">Opening Balance</td>
                                            <td className="text-right py-2 p-2">
                                                {reportData.openingBalance > 0 ? reportData.openingBalance.toFixed(2) : ""}
                                            </td>
                                            <td className="text-right py-2 p-2">
                                                {reportData.openingBalance < 0 ? Math.abs(reportData.openingBalance).toFixed(2) : ""}
                                            </td>
                                            <td className="text-right py-2 p-2">{reportData.openingBalance.toFixed(2)}</td>
                                        </tr>
                                    )}

                                    {transactions.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-4 text-muted-foreground p-2">No transactions found in this period</td></tr>
                                    ) : (
                                        transactions.map((tx, i) => (
                                            <tr key={i} className="border-b hover:bg-muted/20">
                                                <td className="py-2 p-2">{format(new Date(tx.date), "dd-MMM-yyyy")}</td>
                                                <td className="py-2 p-2">{tx.voucherType}</td>
                                                <td className="py-2 p-2">{tx.voucherNumber}</td>
                                                <td className="py-2 p-2">{tx.description}</td>
                                                <td className="text-right py-2 p-2">{tx.debit > 0 ? tx.debit.toFixed(2) : ""}</td>
                                                <td className="text-right py-2 p-2">{tx.credit > 0 ? tx.credit.toFixed(2) : ""}</td>
                                                <td className="text-right py-2 p-2 font-medium">{tx.runningBalance.toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                    <tr className="bg-muted font-bold border-t-2 border-primary/20">
                                        <td colSpan={6} className="py-3 p-2 text-right">Closing Balance</td>
                                        <td className="text-right py-3 p-2">{reportData.closingBalance.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
