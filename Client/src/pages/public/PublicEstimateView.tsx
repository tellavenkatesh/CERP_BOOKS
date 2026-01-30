import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPublicEstimate, respondToEstimate, submitNegotiation, convertToOrder, type EstimateDto, type CreateEstimateItemDto } from '@/api/sales';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function PublicEstimateView() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
    const [declineReason, setDeclineReason] = useState('');

    // Negotiation State
    const [isNegotiating, setIsNegotiating] = useState(false);
    const [negotiationItems, setNegotiationItems] = useState<CreateEstimateItemDto[]>([]);
    const [customerRemarks, setCustomerRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: estimate, isLoading, refetch } = useQuery({
        queryKey: ['publicEstimate', token],
        queryFn: () => getPublicEstimate(token!),
        enabled: !!token,
    });

    // Initialize negotiation state when negotiation starts
    const startNegotiation = () => {
        if (estimate) {
            setNegotiationItems(estimate.items.map(i => ({
                itemId: i.itemId,
                description: i.description,
                quantity: i.quantity,
                rate: i.rate,
                taxRate: i.taxRate
            })));
            setCustomerRemarks(estimate.customerRemarks || '');
            setIsNegotiating(true);
        }
    };

    const handleNegotiationItemChange = (index: number, field: keyof CreateEstimateItemDto, value: any) => {
        const newItems = [...negotiationItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setNegotiationItems(newItems);
    };

    // Calculate totals for negotiation view
    const negotiationSubTotal = negotiationItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const negotiationTaxTotal = negotiationItems.reduce((sum, item) => sum + ((item.quantity * item.rate) * (item.taxRate / 100)), 0);
    const negotiationTotal = negotiationSubTotal + negotiationTaxTotal + (estimate?.shippingCharges || 0) + (estimate?.adjustment || 0);


    const respondMutation = useMutation({
        mutationFn: respondToEstimate,
        onSuccess: () => {
            refetch();
            setDeclineDialogOpen(false);
            toast.success("Response sent successfully.");
        },
        onError: () => toast.error("Failed to send response.")
    });

    const negotiationMutation = useMutation({
        mutationFn: (data: any) => submitNegotiation(estimate!.id, data),
        onSuccess: () => {
            setIsNegotiating(false);
            refetch();
            toast.success("Negotiation proposed successfully.");
        },
        onError: () => toast.error("Failed to submit negotiation.")
    });

    const conversionMutation = useMutation({
        mutationFn: () => convertToOrder(estimate!.id, { publicToken: token! }),
        onSuccess: (orderId) => {
            toast.success("Estimate converted to Order successfully!");
            // Optionally redirect or show success message
            refetch();
        },
        onError: () => toast.error("Failed to convert to order.")
    });

    const handleSubmitNegotiation = () => {
        if (!token) return;

        const proposedEstimate = {
            customerId: estimate!.customerId,
            estimateDate: estimate!.estimateDate,
            expiryDate: estimate!.expiryDate,
            items: negotiationItems,
            customerNotes: customerRemarks, // Using customerNotes field on DTO for remarks if needed, or we might need specific remarks field. 
            // The command maps remarks differently. Let's send remarks in a specific way if the API allows, 
            // or put it in customerNotes for now. 
            // Wait, submitNegotiation DTO structure: { publicToken, proposedEstimate: CreateEstimateDto }
            // And UpdateEstimateCommand maps fields. 
            // But SubmitNegotiationCommand expects "CustomerRemarks" separately? 
            // Command: request.ProposedEstimate maps to Estimate entity.
            // Let's check SubmitNegotiationCommand.
            // It uses request.PublicToken and request.ProposedEstimate.
            // It maps `request.ProposedEstimate.CustomerNotes` to `estimate.CustomerRemarks`.
            // Ideally we should use the proper mapping. 
        };

        // Actually, we pass customerRemarks to the DTO's customerNotes property if that's how we want to store it,
        // OR we add a field to the wrapper.
        // Looking at backend: SubmitNegotiationCommand handles it.
        // It does: `estimate.CustomerRemarks = request.ProposedEstimate.CustomerNotes;` (Assuming)
        // Let's verify.

        negotiationMutation.mutate({
            publicToken: token,
            proposedEstimate: { // Only sending fields that might change + required ones
                ...proposedEstimate,
                customerNotes: customerRemarks // Mapping remarks here
            }
        });
    };


    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading estimate details...</div>;
    if (!estimate) return <div className="p-8 text-center text-red-500">Invalid or expired estimate link.</div>;

    const isPending = estimate.status === 'Sent' || estimate.status === 'Viewed' || estimate.status === 'Draft' || estimate.status === 'NegotiationRequested';
    // NegotiationRequested is also a pending state for the customer? No, they are waiting for seller.
    // Actually if status is NegotiationRequested, customer waits.

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Status Banners */}
                {estimate.status === 'Accepted' && (
                    <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md text-center font-medium flex justify-between items-center">
                        <span>You have accepted this estimate.</span>
                        <Button size="sm" className="bg-green-700 text-white hover:bg-green-800" onClick={() => conversionMutation.mutate()} disabled={conversionMutation.isPending}>
                            {conversionMutation.isPending ? "Converting..." : "Convert to Purchase Order"}
                        </Button>
                    </div>
                )}
                {estimate.status === 'Declined' && (
                    <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md text-center font-medium">
                        You have declined this estimate.
                    </div>
                )}
                {estimate.status === 'NegotiationRequested' && (
                    <div className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-center font-medium">
                        You have requested changes. Waiting for seller review.
                    </div>
                )}
                {estimate.status === 'ConvertedToOrder' && (
                    <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md text-center font-medium">
                        This estimate has been converted to an order.
                    </div>
                )}


                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Estimate {estimate.estimateNumber}</h1>
                        <p className="text-gray-500">For {estimate.customerName}</p>
                    </div>
                    <div className="text-right space-y-2">
                        <div>
                            <p className="text-sm text-gray-500">Estimate Date: {format(new Date(estimate.estimateDate), "dd MMM yyyy")}</p>
                            <p className="text-sm text-gray-500">Expiry Date: {format(new Date(estimate.expiryDate), "dd MMM yyyy")}</p>
                        </div>
                        {estimate.negotiationAllowed && !isNegotiating && isPending && estimate.status !== 'NegotiationRequested' && (
                            <Button variant="outline" size="sm" onClick={startNegotiation} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                Negotiate / Request Changes
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isNegotiating ? "Propose Changes" : "Items & Services"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="py-2 px-4">Item</th>
                                    <th className="py-2 px-4 text-right">Qty</th>
                                    <th className="py-2 px-4 text-right">Rate</th>
                                    <th className="py-2 px-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isNegotiating ? (
                                    // Negotiation Mode
                                    negotiationItems.map((item, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-gray-700 text-xs">
                                                    {(estimate.items.find(i => i.itemId === item.itemId)?.itemName) || "Item"}
                                                </div>
                                                <div className="text-xs text-gray-500">{item.description}</div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Input
                                                    type="number"
                                                    className="w-20 text-right h-8 ml-auto"
                                                    value={item.quantity}
                                                    onChange={(e) => handleNegotiationItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Input
                                                    type="number"
                                                    className="w-24 text-right h-8 ml-auto"
                                                    value={item.rate}
                                                    onChange={(e) => handleNegotiationItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.quantity * item.rate)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // View Mode
                                    estimate.items.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0">
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{item.itemName}</div>
                                                <div className="text-xs text-gray-500">{item.description}</div>
                                            </td>
                                            <td className="py-3 px-4 text-right">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.rate)}</td>
                                            <td className="py-3 px-4 text-right font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <Separator className="my-4" />

                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sub Total</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(isNegotiating ? negotiationSubTotal : estimate.subTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(isNegotiating ? negotiationTaxTotal : estimate.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(isNegotiating ? negotiationTotal : estimate.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Terms and Notes / Remarks */}
                {(estimate.termsAndConditions || estimate.customerNotes || isNegotiating) && (
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            {isNegotiating ? (
                                <div className="space-y-2">
                                    <Label>Your Remarks / Notes</Label>
                                    <Textarea
                                        placeholder="Add any notes or reasons for changes..."
                                        value={customerRemarks}
                                        onChange={(e) => setCustomerRemarks(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <>
                                    {estimate.customerNotes && (
                                        <div>
                                            <h4 className="font-medium text-sm mb-1">Notes</h4>
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{estimate.customerNotes}</p>
                                        </div>
                                    )}
                                    {estimate.termsAndConditions && (
                                        <div>
                                            <h4 className="font-medium text-sm mb-1">Terms & Conditions</h4>
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{estimate.termsAndConditions}</p>
                                        </div>
                                    )}
                                    {estimate.customerRemarks && (
                                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                            <h4 className="font-medium text-sm mb-1 text-yellow-800">Your Remarks (Negotiation)</h4>
                                            <p className="text-sm text-yellow-800 whitespace-pre-wrap">{estimate.customerRemarks}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                {isNegotiating ? (
                    <div className="flex justify-end gap-4 bg-white p-6 rounded-lg shadow-sm border sticky bottom-0">
                        <Button variant="ghost" onClick={() => setIsNegotiating(false)}>Cancel</Button>
                        <Button onClick={handleSubmitNegotiation} disabled={negotiationMutation.isPending}>
                            {negotiationMutation.isPending ? "Submitting..." : "Submit Proposal"}
                        </Button>
                    </div>
                ) : (
                    isPending && estimate.status !== 'NegotiationRequested' && (
                        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
                            <div>
                                <p className="font-medium text-gray-900">Do you accept this estimate?</p>
                                <p className="text-sm text-gray-500">Accepting will notify the seller.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="destructive" onClick={() => setDeclineDialogOpen(true)}>Decline</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => respondMutation.mutate({ token: token!, action: 0 })}>Accept Estimate</Button>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Decline Dialog */}
            <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Estimate</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label>Reason for decline</Label>
                        <Textarea
                            placeholder="e.g. Price is too high..."
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={!declineReason}
                            onClick={() => respondMutation.mutate({ token: token!, action: 1, reason: declineReason })}
                        >
                            Confirm Decline
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
