import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEstimateById, getEstimateVersions, type EstimateDto, type EstimateVersionDto, updateEstimate, sendEstimate } from '@/api/sales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EstimateComparisonView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: estimate, isLoading: isLoadingEstimate } = useQuery({
        queryKey: ['estimate', id],
        queryFn: () => getEstimateById(id!),
        enabled: !!id,
    });

    const { data: versions, isLoading: isLoadingVersions } = useQuery({
        queryKey: ['estimateVersions', id],
        queryFn: () => getEstimateVersions(id!),
        enabled: !!id,
    });

    // Default to comparing Current (Right) with Latest Version (Left)
    // Actually, "Current" is the Proposed one if status is NegotiationRequested.
    // "Latest Version" is the Snapshot of what it WAS before Negotiation.

    // We want to compare:
    // Snapshot (Old) vs Current (New/Proposed)

    const isLoading = isLoadingEstimate || isLoadingVersions;

    // Helper to parse snapshot
    const parseSnapshot = (json?: string): EstimateDto | null => {
        if (!json) return null;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error("Failed to parse snapshot", e);
            return null;
        }
    };

    const latestVersion = versions && versions.length > 0 ? versions[0] : null;
    const previousEstimate = parseSnapshot(latestVersion?.snapshotJson);

    const acceptNegotiationMutation = useMutation({
        mutationFn: async () => {
            // To "Accept", we basically just mark it as Sent (so customer can act)
            // Or we might want a specific status "NegotiationAccepted".
            // For now, let's assume we re-send it or just update any field if needed. 
            // Actually, if we just want to Change Status from "NegotiationRequested" to "Sent",
            // we can use sendEstimate again? Or update status manually.
            // Let's assume sending it again notifies the customer "Hey, I accepted your changes" (implicitly, as it is now official).
            await sendEstimate(id!);
        },
        onSuccess: () => {
            toast.success("Negotiation accepted. Estimate sent to customer.");
            navigate('/sales/estimates');
        },
        onError: () => toast.error("Failed to accept negotiation.")
    });

    if (isLoading) return <div className="p-8">Loading comparison...</div>;
    if (!estimate || !id) return <div className="p-8">Estimate not found</div>;

    if (!previousEstimate) {
        return (
            <div className="p-8">
                <Button variant="ghost" className="mb-4" onClick={() => navigate(`/sales/estimates/${id}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Estimate
                </Button>
                <div className="text-center text-gray-500 mt-10">
                    No version history found. This estimate has not been negotiated yet.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/sales/estimates/${id}`)} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Estimate
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight mt-2">Negotiation Comparison</h1>
                    <p className="text-muted-foreground">Compare customer proposal with previous version.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/sales/estimates/${id}`)}>Edit Estimate</Button>
                    <Button onClick={() => acceptNegotiationMutation.mutate()} disabled={acceptNegotiationMutation.isPending}>
                        {acceptNegotiationMutation.isPending ? "Processing..." : "Accept & Send to Customer"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Left Side: Previous Version */}
                <Card className="border-red-200 bg-red-50/10">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-700">Previous Version (Salesperson)</CardTitle>
                        <CardDescription>
                            Version {latestVersion?.versionNumber} • {format(new Date(latestVersion!.createdAt), "PP p")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ComparisonContent estimate={previousEstimate} />
                    </CardContent>
                </Card>

                {/* Right Side: Current (Proposed) */}
                <Card className="border-green-200 bg-green-50/10">
                    <CardHeader>
                        <CardTitle className="text-lg text-green-700">Proposed Changes (Customer)</CardTitle>
                        <CardDescription>
                            Current Draft • {estimate.customerRemarks ? "Includes Remarks" : "No Remarks"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {estimate.customerRemarks && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                <strong>Customer Remarks:</strong> {estimate.customerRemarks}
                            </div>
                        )}
                        <ComparisonContent estimate={estimate} highlight />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ComparisonContent({ estimate, highlight = false }: { estimate: EstimateDto, highlight?: boolean }) {
    return (
        <div className="space-y-4">
            <div>
                <div className="text-sm font-medium text-gray-500">Totals</div>
                <div className="flex justify-between items-end border-b pb-2">
                    <div>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(estimate.totalAmount)}</div>
                        <div className="text-xs text-gray-500">Subtotal: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(estimate.subTotal)}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Line Items</div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500">
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-right">Qty</th>
                            <th className="pb-2 text-right">Rate</th>
                            <th className="pb-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estimate.items.map((item, idx) => (
                            <tr key={idx} className="border-t">
                                <td className="py-2 pr-2">
                                    <div className="font-medium">{item.itemName}</div>
                                </td>
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.rate)}</td>
                                <td className="py-2 text-right font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
