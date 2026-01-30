import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { extractInvoiceData, type InvoiceExtractionResult, type ExtractedLineItem } from '@/api/ai';
import { getParties, getItems, type Party, type Item } from '@/api/masters';
import { createBill, type CreateBillDto } from '@/api/purchase';
import { Upload, FileText, Loader2, X, Check, Eye, Trash2, Save, File, RefreshCw, AlertCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Extended type for UI editing
interface EditableInvoiceData extends InvoiceExtractionResult {
    vendorId?: string;
    lineItems: (ExtractedLineItem & { itemId?: string })[];
}

export default function InvoiceUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Editable State
    const [editedData, setEditedData] = useState<EditableInvoiceData | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Masters for Matching
    const { data: parties } = useQuery({ queryKey: ['parties'], queryFn: getParties });
    const { data: items } = useQuery({ queryKey: ['items'], queryFn: getItems });

    const mutation = useMutation({
        mutationFn: extractInvoiceData,
        onSuccess: (result) => {
            // Auto-Match Logic
            let matchedVendorId: string | undefined;
            if (parties && result.vendorName) {
                const match = parties.find(p => p.name.toLowerCase().includes(result.vendorName.toLowerCase()) || result.vendorName.toLowerCase().includes(p.name.toLowerCase()));
                if (match) matchedVendorId = match.id;
            }

            const matchedLines = result.lineItems.map(line => {
                let matchedItemId: string | undefined;
                if (items) {
                    const match = items.find(i => i.name.toLowerCase().includes(line.description.toLowerCase()));
                    if (match) matchedItemId = match.id;
                }
                return { ...line, itemId: matchedItemId };
            });

            const enriched: EditableInvoiceData = {
                ...result,
                vendorId: matchedVendorId,
                lineItems: matchedLines,
                // Ensure date is string
                invoiceDate: result.invoiceDate ? new Date(result.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };

            setEditedData(enriched);
            toast.success("Invoice Extracted Successfully");
        },
        onError: () => {
            toast.error("Extraction Failed");
            setFile(null);
            setPreviewUrl(null);
        }
    });

    const createBillMutation = useMutation({
        mutationFn: createBill,
        onSuccess: () => {
            toast.success("Draft Voucher Created!", {
                description: `Saved to Draft Bills for ${editedData?.vendorName}`
            });
            // Reset
            setFile(null);
            setPreviewUrl(null);
            setEditedData(null);
        },
        onError: (err) => {
            toast.error("Failed to Create Bill");
            console.error(err);
        }
    });

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setEditedData(null);
            mutation.mutate(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const updateField = (field: keyof EditableInvoiceData, value: any) => {
        if (editedData) {
            setEditedData({ ...editedData, [field]: value });
        }
    };

    const updateLineItem = (index: number, field: keyof ExtractedLineItem | 'itemId', value: any) => {
        if (editedData && editedData.lineItems) {
            const newLines = [...editedData.lineItems];
            newLines[index] = { ...newLines[index], [field]: value };
            setEditedData({ ...editedData, lineItems: newLines });
        }
    };

    const handleSave = () => {
        if (!editedData) return;
        if (!editedData.vendorId) {
            toast.warning("Please select a Vendor first.");
            return;
        }

        // Prepare DTO
        const billLines = editedData.lineItems.map(item => {
            if (!item.itemId) {
                // If no item map, this will fail validation. 
                // For now, let's warn.
                return null;
            }
            return {
                itemId: item.itemId,
                description: item.description,
                quantity: item.quantity,
                rate: item.unitPrice,
                taxRate: 0 // Default or extract?
            };
        }).filter(x => x !== null);

        if (billLines.length !== editedData.lineItems.length) {
            toast.warning("Please select Items for all lines.");
            return;
        }

        const dto: CreateBillDto = {
            vendorId: editedData.vendorId,
            vendorBillNumber: editedData.invoiceNumber,
            billDate: new Date(editedData.invoiceDate as any).toISOString(),
            dueDate: new Date(editedData.invoiceDate as any).toISOString(), // Default
            items: billLines as any
        };

        createBillMutation.mutate(dto);
    };

    return (
        <div className="h-[calc(100vh-4rem)] p-4 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoice Processing</h1>
                    <p className="text-muted-foreground text-sm">AI-powered extraction and verification.</p>
                </div>
                {editedData && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setFile(null); setEditedData(null); setPreviewUrl(null); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Discard
                        </Button>
                        <Button onClick={handleSave} disabled={createBillMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {createBillMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" /> Create Draft Voucher
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Left Column: Upload / Preview */}
                <Card className="flex flex-col h-full overflow-hidden border-2 border-muted/50">
                    {!file ? (
                        <div
                            className={`flex-1 flex flex-col items-center justify-center border-dashed border-2 m-4 rounded-xl transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/50'}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} accept=".pdf,image/*" />
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">Upload Invoice</h3>
                            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">Drag and drop PDF or Image here, or click to browse.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-3 border-b flex justify-between items-center bg-muted/20">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <File className="h-4 w-4 text-indigo-500" />
                                    {file.name}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setEditedData(null); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                                {file.type.includes('pdf') ? (
                                    <iframe src={previewUrl!} className="w-full h-full" title="PDF Preview" />
                                ) : (
                                    <img src={previewUrl!} alt="Preview" className="max-w-full max-h-full object-contain" />
                                )}
                                {mutation.isPending && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                                        <p className="text-lg font-semibold animate-pulse">Analyzing Document...</p>
                                        <p className="text-sm text-muted-foreground">Extracting data with Llama Vision</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Right Column: Extracted Data Form */}
                <Card className="flex flex-col h-full overflow-hidden border-2 border-muted/50">
                    <CardHeader className="py-4 border-b bg-muted/10">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Extraction Results</CardTitle>
                            {editedData && (
                                <Badge variant={editedData.confidenceScore > 0.8 ? 'default' : 'secondary'} className={editedData.confidenceScore > 0.8 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                    {(editedData.confidenceScore * 100).toFixed(0)}% Confidence
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-6 space-y-6">
                        {!editedData ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <FileText className="h-16 w-16 mb-4 stroke-1" />
                                <p>Upload a document to see extracted details here.</p>
                            </div>
                        ) : (
                            <>
                                {/* Core Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Vendor / Customer</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={editedData.vendorId}
                                                onValueChange={(val) => updateField('vendorId', val)}
                                            >
                                                <SelectTrigger className={!editedData.vendorId ? "border-red-300" : ""}>
                                                    <SelectValue placeholder="Select Vendor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {parties?.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Simulate Auto-Match */}
                                            {editedData.vendorId && (
                                                <div className="flex items-center justify-center h-10 w-10 text-green-500 bg-green-50 rounded border border-green-100" title="Matched to Master">
                                                    <Check className="h-5 w-5" />
                                                </div>
                                            )}
                                            {!editedData.vendorId && (
                                                <div className="flex items-center justify-center h-10 w-10 text-yellow-500 bg-yellow-50 rounded border border-yellow-100" title="No Match Found">
                                                    <AlertCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Original: {editedData.vendorName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Invoice Number</Label>
                                        <Input
                                            value={editedData.invoiceNumber || ''}
                                            onChange={(e) => updateField('invoiceNumber', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Invoice Date</Label>
                                        <Input
                                            type="date"
                                            value={editedData.invoiceDate ? new Date(editedData.invoiceDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => updateField('invoiceDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-indigo-600 font-semibold">Suggested Account</Label>
                                        <div className="relative">
                                            <Input
                                                className="border-indigo-200 bg-indigo-50/50"
                                                value={editedData.suggestedAccount || ''}
                                                onChange={(e) => updateField('suggestedAccount', e.target.value)}
                                            />
                                            <div className="absolute right-3 top-2.5" title="Regenerate Suggestion">
                                                <RefreshCw className="h-4 w-4 text-indigo-400 cursor-pointer hover:text-indigo-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Line Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="font-semibold">Line Items</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => {
                                                const newLines = [...(editedData.lineItems || [])];
                                                newLines.push({ description: '', quantity: 1, unitPrice: 0, total: 0 });
                                                setEditedData({ ...editedData, lineItems: newLines });
                                            }}
                                        >
                                            + Add Item
                                        </Button>
                                    </div>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="w-[30%]">Item</TableHead>
                                                    <TableHead className="w-[25%]">Description</TableHead>
                                                    <TableHead className="w-[15%] text-right">Qty</TableHead>
                                                    <TableHead className="w-[15%] text-right">Rate</TableHead>
                                                    <TableHead className="w-[15%] text-right">Amount</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {editedData.lineItems?.map((item, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="p-2">
                                                            <Select
                                                                value={item.itemId}
                                                                onValueChange={(val) => updateLineItem(idx, 'itemId', val)}
                                                            >
                                                                <SelectTrigger className="h-8 border-transparent focus:border-input">
                                                                    <SelectValue placeholder="Select Item" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {items?.map(i => (
                                                                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            <Input
                                                                className="h-8 shadow-none border-0 focus-visible:ring-0 px-0"
                                                                value={item.description}
                                                                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2 text-right">
                                                            <Input
                                                                type="number"
                                                                className="h-8 shadow-none border-0 focus-visible:ring-0 px-0 text-right"
                                                                value={item.quantity}
                                                                onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value))}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2 text-right">
                                                            <Input
                                                                type="number"
                                                                className="h-8 shadow-none border-0 focus-visible:ring-0 px-0 text-right"
                                                                value={item.unitPrice}
                                                                onChange={(e) => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value))}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2 text-right font-medium">
                                                            {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer" />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <Separator />

                                {/* Totals */}
                                <div className="space-y-3 bg-muted/10 p-4 rounded-lg">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Tax Amount (GST/TDS)</span>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                className="h-8 text-right bg-white"
                                                value={editedData.taxAmount}
                                                onChange={(e) => updateField('taxAmount', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-md font-bold">
                                        <span>Total Amount</span>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                className="h-10 text-right font-bold bg-white border-indigo-200"
                                                value={editedData.totalAmount}
                                                onChange={(e) => updateField('totalAmount', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
