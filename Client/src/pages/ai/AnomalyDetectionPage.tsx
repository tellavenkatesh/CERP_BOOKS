import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { detectAnomalies, type AnomalyItem } from '@/api/ai';
import { AlertTriangle, AlertOctagon, Calendar, Eye, Play, CheckCircle } from 'lucide-react';

export default function AnomalyDetectionPage() {
    const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const handleRunCheck = async () => {
        setLoading(true);
        try {
            // Sending sample data for demonstration. In real app, backend would query DB.
            // We pass a dummy object to satisfy the API signature, backend logic will likely return mock result logic if not connected to live DB query
            // But we implemented basic prompt.
            const data = await detectAnomalies({
                transactions: [
                    { id: "1", amount: 500, date: "2024-01-01", description: "Test" },
                    { id: "2", amount: 500000, date: "2024-01-02", description: "Outlier Test" },
                    { id: "3", amount: 500, date: "2024-01-01", description: "Test" } // Duplicate
                ]
            });
            setAnomalies(data.anomalies || []);
            setHasRun(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Anomaly Detection</h1>
            <p className="text-muted-foreground mb-6">Automated checks for unusual patterns, potential duplicates, or errors.</p>

            <div className="mb-6">
                <Button onClick={handleRunCheck} disabled={loading} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    {loading ? "Running Analysis..." : "Run Anomaly Scan (Demo)"}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {anomalies.map((item, idx) => (
                    <Card key={idx} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="mt-1">
                                {item.severity === 'High' ? (
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertOctagon className="h-6 w-6 text-red-600" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{item.type} Detected</h3>
                                    <Badge variant="destructive" className="uppercase text-[10px]">{item.severity} Priority</Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>Detected on {item.date || new Date().toISOString().split('T')[0]}</span>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" /> Review
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {hasRun && anomalies.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">All Clean</h3>
                            <p>No anomalies detected in the scanned transactions.</p>
                        </CardContent>
                    </Card>
                )}
                {!hasRun && (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        Click "Run Anomaly Scan" to start.
                    </div>
                )}
            </div>
        </div>
    );
}
