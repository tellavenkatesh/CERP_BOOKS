import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSalesOrderReport } from "@/api/reports";
import { exportToCSV } from "@/utils/exportToCSV";

export default function SalesOrderReports() {
    const { data: entries = [], refetch, isFetching } = useQuery({
        queryKey: ["sales-order-report"],
        queryFn: getSalesOrderReport
    });

    const pendingOrders = entries.filter(e => e.status === "Pending");
    const overdueOrders = entries.filter(e => e.status !== "Completed" && e.deliveryDate && new Date(e.deliveryDate) < new Date());

    const handleExport = () => {
        if (entries.length === 0) return;
        const data = entries.map(e => ({
            "Order #": e.orderNo,
            Date: format(new Date(e.date), "yyyy-MM-dd"),
            Customer: e.partyName,
            Amount: e.totalAmount,
            Status: e.status,
            "Delivery Date": e.deliveryDate ? format(new Date(e.deliveryDate), "yyyy-MM-dd") : "-"
        }));
        exportToCSV(data, `SalesOrders`);
    };

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Sales Order Reports</CardTitle>
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

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending Orders</TabsTrigger>
                    <TabsTrigger value="all">Order Status</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue Deliveries</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Sales Orders</CardTitle>
                            <p className="text-sm text-muted-foreground">Total Pending: {pendingOrders.length}</p>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Order #</th>
                                        <th className="text-left py-2">Date</th>
                                        <th className="text-left py-2">Customer</th>
                                        <th className="text-right py-2">Amount</th>
                                        <th className="text-left py-2 pl-4">Delivery Date</th>
                                        <th className="text-right py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map((order, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{order.orderNo}</td>
                                            <td className="py-2">{format(new Date(order.date), "dd-MMM-yyyy")}</td>
                                            <td className="py-2">{order.partyName}</td>
                                            <td className="text-right py-2">{order.totalAmount.toFixed(2)}</td>
                                            <td className="py-2 pl-4">{order.deliveryDate ? format(new Date(order.deliveryDate), "dd-MMM-yyyy") : "-"}</td>
                                            <td className="text-right py-2 font-medium text-amber-600">{order.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardHeader><CardTitle>All Sales Orders Status</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Order #</th>
                                        <th className="text-left py-2">Date</th>
                                        <th className="text-left py-2">Customer</th>
                                        <th className="text-right py-2">Amount</th>
                                        <th className="text-right py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((order, i) => (
                                        <tr key={i} className="border-b hover:bg-muted/20">
                                            <td className="py-2">{order.orderNo}</td>
                                            <td className="py-2">{format(new Date(order.date), "dd-MMM-yyyy")}</td>
                                            <td className="py-2">{order.partyName}</td>
                                            <td className="text-right py-2">{order.totalAmount.toFixed(2)}</td>
                                            <td className="text-right py-2 font-medium">
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === "Completed" ? "bg-green-100 text-green-800" :
                                                    order.status === "Partial" ? "bg-amber-100 text-amber-800" :
                                                        "bg-blue-100 text-blue-800"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overdue">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600">Overdue Deliveries</CardTitle>
                            <p className="text-sm text-muted-foreground">Orders past delivery date: {overdueOrders.length}</p>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Order #</th>
                                        <th className="text-left py-2">Date</th>
                                        <th className="text-left py-2">Customer</th>
                                        <th className="text-left py-2 font-bold text-red-600">Due Date</th>
                                        <th className="text-right py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueOrders.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-4 text-green-600">No overdue orders!</td></tr>
                                    ) : (
                                        overdueOrders.map((order, i) => (
                                            <tr key={i} className="border-b bg-red-50 hover:bg-red-100">
                                                <td className="py-2">{order.orderNo}</td>
                                                <td className="py-2">{format(new Date(order.date), "dd-MMM-yyyy")}</td>
                                                <td className="py-2">{order.partyName}</td>
                                                <td className="py-2 font-bold text-red-700">{order.deliveryDate ? format(new Date(order.deliveryDate), "dd-MMM-yyyy") : "-"}</td>
                                                <td className="text-right py-2 font-medium text-red-700">{order.status}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
