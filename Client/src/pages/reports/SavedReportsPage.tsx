import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Play, Trash2 } from "lucide-react";

export default function SavedReportsPage() {
    const savedReports = [
        { id: 1, name: "Monthly Sales by Region", type: "Sales", lastRun: "2024-01-05" },
        { id: 2, name: "High Value Vendors", type: "Purchase", lastRun: "2023-12-28" },
        { id: 3, name: "Q4 Tax Summary", type: "Tax", lastRun: "2024-01-08" },
    ];

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">My Saved Reports</h1>
            <div className="grid gap-4">
                {savedReports.map(report => (
                    <Card key={report.id}>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{report.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">Type: {report.type} • Last Run: {report.lastRun}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Play className="h-4 w-4 mr-2" /> Run
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
