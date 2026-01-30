import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    getPurchaseRequests, createPurchaseRequest, approvePurchaseRequest, updatePurchaseRequest,
    type CreatePurchaseRequestDto, type CreatePurchaseRequestItemDto
} from '@/api/purchase';
import { getItems } from '@/api/masters';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PurchaseRequestsPage = () => {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [approvalId, setApprovalId] = useState<string | null>(null);
    const [approvalRemarks, setApprovalRemarks] = useState('');

    // Queries
    const { data: prs, isLoading } = useQuery({
        queryKey: ['purchaserequests'],
        queryFn: getPurchaseRequests
    });

    const { data: items } = useQuery({
        queryKey: ['items'],
        queryFn: getItems
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createPurchaseRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaserequests'] });
            setIsCreateOpen(false);
            toast.success("Purchase Request created successfully.");
        },
        onError: () => {
            toast.error("Failed to create Purchase Request.");
        }
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, remarks }: { id: string; remarks: string }) => approvePurchaseRequest(id, remarks),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaserequests'] });
            toast.success("Purchase Request approved.");
            setApprovalId(null);
            setApprovalRemarks('');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreatePurchaseRequestDto }) => updatePurchaseRequest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchaserequests'] });
            setIsCreateOpen(false);
            setEditingId(null);
            toast.success("Purchase Request updated successfully.");
        },
        onError: () => {
            toast.error("Failed to update Purchase Request.");
        }
    });

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreatePurchaseRequestDto>({
        requiredDate: format(new Date(), 'yyyy-MM-dd'),
        requestedBy: '',
        reason: '',
        department: '',
        priority: 1, // Medium
        items: []
    });

    const [currentItem, setCurrentItem] = useState<CreatePurchaseRequestItemDto>({
        itemId: '',
        description: '',
        quantity: 1,
        estimatedRate: 0
    });

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!isCreateOpen) {
            setFormData({
                requiredDate: format(new Date(), 'yyyy-MM-dd'),
                requestedBy: '',
                reason: '',
                department: '',
                priority: 1,
                items: []
            });
            setEditingId(null);
            setCurrentItem({ itemId: '', description: '', quantity: 1, estimatedRate: 0 });
        }
    }, [isCreateOpen]);

    const handleAddItem = () => {
        if (!currentItem.itemId || currentItem.quantity <= 0) return;
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, currentItem]
        }));
        setCurrentItem({ itemId: '', description: '', quantity: 1, estimatedRate: 0 });
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (pr: any) => {
        setEditingId(pr.id);
        setFormData({
            requiredDate: pr.requiredDate ? format(new Date(pr.requiredDate), 'yyyy-MM-dd') : '',
            requestedBy: pr.requestedBy,
            reason: pr.reason,
            department: pr.department,
            priority: pr.priority,
            items: pr.items.map((i: any) => ({
                itemId: i.itemId,
                description: i.description || i.itemName,
                quantity: i.quantity,
                estimatedRate: i.estimatedRate
            }))
        });
        setIsCreateOpen(true);
    };

    const handleApproveClick = (id: string) => {
        setApprovalId(id);
        setApprovalRemarks('');
    };

    const confirmApprove = () => {
        if (approvalId) {
            approveMutation.mutate({ id: approvalId, remarks: approvalRemarks });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'PendingApproval': return 'bg-yellow-100 text-yellow-800';
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadge = (priority: number) => {
        switch (priority) {
            case 2: return <Badge variant="destructive">High</Badge>;
            case 1: return <Badge variant="default" className="bg-blue-500">Medium</Badge>;
            default: return <Badge variant="secondary">Low</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Purchase Requests</h2>
                    <p className="text-muted-foreground">Manage internal purchase requisitions.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Purchase Request' : 'Create Purchase Request'}</DialogTitle>
                            <DialogDescription>{editingId ? 'Modify existing request.' : 'Create a new requisition for items.'}</DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Required Date</Label>
                                <Input type="date" value={formData.requiredDate} onChange={e => setFormData({ ...formData, requiredDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Requested By</Label>
                                <Input value={formData.requestedBy} onChange={e => setFormData({ ...formData, requestedBy: e.target.value })} placeholder="Employee Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="IT, HR, etc." />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={formData.priority.toString()} onValueChange={val => setFormData({ ...formData, priority: parseInt(val) })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Low</SelectItem>
                                        <SelectItem value="1">Medium</SelectItem>
                                        <SelectItem value="2">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Reason</Label>
                                <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Purpose of request" />
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="border rounded-md p-4 space-y-4">
                            <h4 className="font-semibold text-sm">Request Items</h4>
                            <div className="grid grid-cols-4 gap-2 items-end">
                                <div className="space-y-2 col-span-2">
                                    <Label>Item</Label>
                                    <Select value={currentItem.itemId} onValueChange={(val) => {
                                        const item = items?.find(i => i.id === val);
                                        setCurrentItem({ ...currentItem, itemId: val, estimatedRate: item?.purchasePrice || 0, description: item?.name || '' })
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Item" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {items?.map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity</Label>
                                    <Input type="number" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Est. Rate</Label>
                                    <Input type="number" value={currentItem.estimatedRate} onChange={e => setCurrentItem({ ...currentItem, estimatedRate: parseFloat(e.target.value) })} />
                                </div>
                                <Button variant="secondary" onClick={handleAddItem}>Add</Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Est. Rate</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{item.estimatedRate}</TableCell>
                                            <TableCell className="text-right">{(item.quantity * item.estimatedRate).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || formData.items.length === 0}>
                                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingId ? 'Update Request' : 'Create Request')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Approval Dialog */}
                <Dialog open={!!approvalId} onOpenChange={(open) => !open && setApprovalId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Purchase Request</DialogTitle>
                            <DialogDescription>Add remarks for this approval.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            <Label>Remarks</Label>
                            <Textarea value={approvalRemarks} onChange={e => setApprovalRemarks(e.target.value)} placeholder="Approved per budget..." />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setApprovalId(null)}>Cancel</Button>
                            <Button onClick={confirmApprove} disabled={approveMutation.isPending}>
                                {approveMutation.isPending ? 'Approving...' : 'Confirm Approve'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PR #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Requester</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approver</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : prs?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground">No purchase requests found.</TableCell>
                                </TableRow>
                            ) : (
                                prs?.map((pr) => (
                                    <TableRow key={pr.id}>
                                        <TableCell className="font-medium">{pr.requestNumber}</TableCell>
                                        <TableCell>{format(new Date(pr.requestDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{pr.requestedBy}</TableCell>
                                        <TableCell>{pr.department}</TableCell>
                                        <TableCell>{pr.reason}</TableCell>
                                        <TableCell>{getPriorityBadge(pr.priority)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(pr.status)}>
                                                {pr.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {pr.approvedBy ? (
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-medium">{pr.approvedBy}</span>
                                                    {pr.remarks && <span className="text-muted-foreground max-w-[150px] truncate" title={pr.remarks}>{pr.remarks}</span>}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {pr.status === 'Draft' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(pr)}>
                                                        <FileText className="h-4 w-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleApproveClick(pr.id)}>
                                                        <Check className="h-4 w-4 text-green-600 mr-1" /> Approve
                                                    </Button>
                                                </>
                                            )}
                                            {pr.status === 'Approved' && (
                                                <Link to={`/purchase/orders/new?prId=${pr.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        Create PO
                                                    </Button>
                                                </Link>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PurchaseRequestsPage;
