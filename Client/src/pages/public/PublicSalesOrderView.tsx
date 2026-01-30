import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPublicSalesOrder, respondToSalesOrder } from '@/api/sales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function PublicSalesOrderView() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineInput, setShowDeclineInput] = useState(false);

    const { data: order, isLoading } = useQuery({
        queryKey: ['public-salesorder', token],
        queryFn: () => getPublicSalesOrder(token!),
        enabled: !!token,
    });

    const mutation = useMutation({
        mutationFn: respondToSalesOrder,
        onSuccess: () => {
            toast.success("Response submitted successfully!");
            window.location.reload();
        },
        onError: () => {
            toast.error("Failed to submit response.");
        }
    });

    const handleAccept = () => {
        if (confirm("Are you sure you want to accept this Sales Order?")) {
            mutation.mutate({ token: token!, action: 0 });
        }
    };

    const handleDecline = () => {
        if (!declineReason) {
            toast.error("Please provide a reason for declining.");
            return;
        }
        mutation.mutate({ token: token!, action: 1, reason: declineReason });
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!order) {
        return <div className="flex h-screen items-center justify-center text-red-500">Sales Order not found or expired.</div>;
    }

    const isPending = order.status === 'Draft' || order.status === 'Sent'; // Assuming 'Sent' or 'Draft' means pending customer action if logic dictates

    // Basic interpretation of status for UI
    const getStatusBadge = (status: string) => {
        // You might want to map specific statuses more accurately
        if (status === 'Confirmed') return <Badge className="bg-green-600">Accepted</Badge>;
        if (status === 'Cancelled') return <Badge variant="destructive">Declined</Badge>;
        return <Badge variant="secondary">{status}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-4xl space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Sales Order #{order.orderNumber}</CardTitle>
                            <CardDescription>Date: {new Date(order.orderDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <div>
                            {getStatusBadge(order.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-500">Customer</p>
                                <p>{order.customerName}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-500">Total Amount</p>
                                <p className="text-lg font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount)}</p>
                            </div>
                            {order.customerPONumber && (
                                <div>
                                    <p className="font-semibold text-gray-500">PO Number</p>
                                    <p>{order.customerPONumber}</p>
                                </div>
                            )}
                            {order.expectedDeliveryDate && (
                                <div>
                                    <p className="font-semibold text-gray-500">Expected Delivery</p>
                                    <p>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.itemName}</div>
                                                <div className="text-xs text-gray-500">{item.description}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.unitPrice)}</TableCell>
                                            <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.totalAmount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Customer Actions */}
                        {(order.status === 'Sent' || order.status === 'Draft') && !mutation.isSuccess && (
                            <div className="rounded-lg bg-white p-6 shadow-sm border mt-8">
                                <h3 className="text-lg font-semibold mb-4">Action Required</h3>
                                <p className="text-gray-600 mb-6">Please review the details above and verify the Sales Order.</p>

                                {!showDeclineInput ? (
                                    <div className="flex gap-4">
                                        <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700" disabled={mutation.isPending}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Accept Order
                                        </Button>
                                        <Button onClick={() => setShowDeclineInput(true)} variant="destructive" className="flex-1" disabled={mutation.isPending}>
                                            <XCircle className="mr-2 h-4 w-4" /> Decline
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Reason for declining..."
                                            value={declineReason}
                                            onChange={(e) => setDeclineReason(e.target.value)}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" onClick={() => setShowDeclineInput(false)}>Cancel</Button>
                                            <Button variant="destructive" onClick={handleDecline} disabled={mutation.isPending}>Submit Decline</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {mutation.isSuccess && (
                            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                                Thank you! Your response has been recorded.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
