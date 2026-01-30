import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Check, Upload, LayoutTemplate, Palette, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInvoiceTemplate, type CreateInvoiceTemplateRequest } from '@/api/masters';
import { toast } from 'sonner';

export default function InvoiceTemplatesPage() {
    const [templateName, setTemplateName] = useState('Standard Business');
    const [primaryColor, setPrimaryColor] = useState('#2563eb');
    const [accentColor, setAccentColor] = useState('#1e40af');
    const [layout, setLayout] = useState('classic');
    const [showBankDetails, setShowBankDetails] = useState(true);
    const [headerText, setHeaderText] = useState('');
    const [footerText, setFooterText] = useState('');
    const [isDefault, setIsDefault] = useState(true);
    const [logo, setLogo] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const mutation = useMutation({
        mutationFn: createInvoiceTemplate,
        onSuccess: () => {
            toast.success("Invoice template saved successfully.");
            queryClient.invalidateQueries({ queryKey: ["invoiceTemplates"] });
        },
        onError: (error) => {
            toast.error("Failed to save template.");
        }
    });

    const handleSave = () => {
        const payload: CreateInvoiceTemplateRequest = {
            name: templateName,
            layout,
            primaryColor,
            accentColor,
            headerText,
            footerText,
            showBankDetails,
            logo: logo || "",
            isDefault,
            isActive: true
        };
        mutation.mutate(payload);
    };

    return (
        <div className="container mx-auto py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoice Templates</h1>
                    <p className="text-muted-foreground mt-1">Customize the look and feel of your invoices and estimates.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Discard Changes</Button>
                    <Button onClick={handleSave} disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Save Template
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Settings</CardTitle>
                            <CardDescription>Configure basic details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="templateName">Template Name</Label>
                                <Input
                                    id="templateName"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 justify-between">
                                <Label htmlFor="default">Set as Default</Label>
                                <Switch id="default" checked={isDefault} onCheckedChange={setIsDefault} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" /> Branding
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Company Logo</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleLogoUpload}
                                    />
                                    {logo ? (
                                        <img src={logo} alt="Logo" className="h-16 object-contain mb-2" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <p className="text-sm font-medium">Click to upload logo</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-10 h-10 rounded-md border shadow-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <Input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-full h-10 p-1 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Accent Color</Label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-10 h-10 rounded-md border shadow-sm"
                                            style={{ backgroundColor: accentColor }}
                                        />
                                        <Input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-full h-10 p-1 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutTemplate className="h-5 w-5" /> Layout
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup value={layout} onValueChange={setLayout} className="grid grid-cols-3 gap-4">
                                <div>
                                    <RadioGroupItem value="classic" id="classic" className="peer sr-only" />
                                    <Label
                                        htmlFor="classic"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <FileText className="mb-3 h-6 w-6" />
                                        Classic
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="modern" id="modern" className="peer sr-only" />
                                    <Label
                                        htmlFor="modern"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <ImageIcon className="mb-3 h-6 w-6" />
                                        Modern
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="minimal" id="minimal" className="peer sr-only" />
                                    <Label
                                        htmlFor="minimal"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <FileText className="mb-3 h-6 w-6" />
                                        Minimal
                                    </Label>
                                </div>
                            </RadioGroup>

                            <Separator />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Header Text</Label>
                                    <Textarea
                                        placeholder="Thank you for your business!"
                                        className="resize-none"
                                        rows={2}
                                        value={headerText}
                                        onChange={(e) => setHeaderText(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer Text / Terms</Label>
                                    <Textarea
                                        placeholder="Payment due within 30 days."
                                        className="resize-none"
                                        rows={3}
                                        value={footerText}
                                        onChange={(e) => setFooterText(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2">
                                    <Label htmlFor="bankDetails">Show Bank Details</Label>
                                    <Switch
                                        id="bankDetails"
                                        checked={showBankDetails}
                                        onCheckedChange={setShowBankDetails}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Panel - Sticky */}
                <div className="lg:col-span-8">
                    <div className="sticky top-6">
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <div className={`h-2 w-full`} style={{ backgroundColor: primaryColor }}></div>
                            <CardContent className="p-10 min-h-[800px] bg-white text-slate-900 font-sans">

                                {/* TEMPLATE: CLASSIC */}
                                {layout === 'classic' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-4">
                                                {logo ? (
                                                    <img src={logo} alt="Logo" className="h-16 object-contain" />
                                                ) : (
                                                    <div className="h-16 w-16 bg-slate-100 rounded flex items-center justify-center text-slate-400">Logo</div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-lg">Acme Corp Inc.</h3>
                                                    <p className="text-sm text-slate-500">123 Business Rd, Tech City</p>
                                                    <p className="text-sm text-slate-500">GSTIN: 29ABCDE1234F1Z5</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <h1 className="text-4xl font-light tracking-tight text-slate-900" style={{ color: primaryColor }}>INVOICE</h1>
                                                <p className="text-slate-500 mt-2">#INV-2024-001</p>
                                                <p className="text-sm font-medium mt-1">Date: {new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-xs uppercase font-bold text-slate-400 mb-1">Bill To</p>
                                                <h4 className="font-bold">Globex Corporation</h4>
                                                <p className="text-sm text-slate-600">42 Industrial Pkwy</p>
                                                <p className="text-sm text-slate-600">Manufacturing Dist, CA 90210</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs uppercase font-bold text-slate-400 mb-1">Total Amount</p>
                                                <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>₹12,450.00</h2>
                                                <p className="text-sm text-red-500 font-medium">Due: {new Date(Date.now() + 86400000 * 15).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Line Items Table */}
                                        <div className="mt-8">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr style={{ backgroundColor: accentColor + '20' }}>
                                                        <th className="text-left py-3 px-4 font-semibold" style={{ color: primaryColor }}>Item</th>
                                                        <th className="text-right py-3 px-4 font-semibold" style={{ color: primaryColor }}>Qty</th>
                                                        <th className="text-right py-3 px-4 font-semibold" style={{ color: primaryColor }}>Rate</th>
                                                        <th className="text-right py-3 px-4 font-semibold" style={{ color: primaryColor }}>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    <tr>
                                                        <td className="py-4 px-4">
                                                            <p className="font-medium">Web Design Services</p>
                                                            <p className="text-xs text-slate-500">Homepage cleanup and redesign</p>
                                                        </td>
                                                        <td className="text-right py-4 px-4">40</td>
                                                        <td className="text-right py-4 px-4">₹250</td>
                                                        <td className="text-right py-4 px-4">₹10,000</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-4 px-4">
                                                            <p className="font-medium">Hosting (Annual)</p>
                                                            <p className="text-xs text-slate-500">Premium cloud hosting</p>
                                                        </td>
                                                        <td className="text-right py-4 px-4">1</td>
                                                        <td className="text-right py-4 px-4">₹2,450</td>
                                                        <td className="text-right py-4 px-4">₹2,450</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end mt-6">
                                            <div className="w-64 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Subtotal</span>
                                                    <span>₹12,450.00</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Tax (18%)</span>
                                                    <span>₹2,241.00</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span style={{ color: primaryColor }}>₹14,691.00</span>
                                                </div>
                                            </div>
                                        </div>

                                        {showBankDetails && (
                                            <div className="mt-12 bg-slate-50 p-6 rounded-lg border">
                                                <h5 className="font-bold text-sm mb-2">Bank Details</h5>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-500 block text-xs">Bank Name</span>
                                                        <span className="font-medium">HDFC Bank</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block text-xs">Account Number</span>
                                                        <span className="font-medium">1234 5678 9012</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block text-xs">IFSC Code</span>
                                                        <span className="font-medium">HDFC0001234</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-8 text-center text-sm text-slate-500">
                                            <p>Thank you for your business!</p>
                                        </div>
                                    </div>
                                )}

                                {/* TEMPLATE: MODERN */}
                                {layout === 'modern' && (
                                    <div className="space-y-8 font-sans">
                                        <div className="flex bg-slate-900 text-white p-8 -m-10 mb-8 items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {logo && <img src={logo} className="h-12 bg-white rounded p-1" />}
                                                <div>
                                                    <h3 className="font-bold text-xl">Acme Corp</h3>
                                                    <p className="text-sm opacity-70">Tech City, Bangalore</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <h1 className="text-3xl font-bold tracking-widest opacity-90">INVOICE</h1>
                                                <p className="opacity-70">#INV-001</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-12 pt-8">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Billed To</p>
                                                <h2 className="text-2xl font-bold text-slate-800">Globex Corp</h2>
                                                <p className="text-slate-600">info@globex.com</p>
                                                <p className="text-slate-600">+1 555-0123</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-slate-500">Invoice Date</span>
                                                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-slate-500">Due Date</span>
                                                    <span className="font-medium text-red-600">{new Date(Date.now() + 86400000 * 15).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between border-b pb-2">
                                                    <span className="text-slate-500">Amount Due</span>
                                                    <span className="font-bold" style={{ color: primaryColor }}>₹14,691.00</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                                                        <th className="text-left py-4 font-bold text-slate-700">Description</th>
                                                        <th className="text-right py-4 font-bold text-slate-700">Qty</th>
                                                        <th className="text-right py-4 font-bold text-slate-700">Price</th>
                                                        <th className="text-right py-4 font-bold text-slate-700">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-dashed">
                                                        <td className="py-4">
                                                            <p className="font-bold text-slate-800">Web Development</p>
                                                            <p className="text-sm text-slate-500">Frontend React implementation</p>
                                                        </td>
                                                        <td className="text-right py-4">40 h</td>
                                                        <td className="text-right py-4">₹250</td>
                                                        <td className="text-right py-4 font-medium">₹10,000</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <div className="bg-slate-100 p-6 rounded w-1/2 space-y-3">
                                                <div className="flex justify-between">
                                                    <span>Subtotal</span>
                                                    <span>₹12,450.00</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-xl" style={{ color: primaryColor }}>
                                                    <span>Total</span>
                                                    <span>₹14,691.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TEMPLATE: MINIMAL */}
                                {layout === 'minimal' && (
                                    <div className="space-y-12 font-mono text-sm max-w-2xl mx-auto">
                                        <div className="text-center space-y-2">
                                            {logo && <img src={logo} className="h-10 mx-auto grayscale" />}
                                            <h2 className="font-bold text-2xl uppercase tracking-widest">Invoice</h2>
                                            <p className="text-slate-500">#INV-2024-001 • {new Date().toLocaleDateString()}</p>
                                        </div>

                                        <div className="border-t border-b border-slate-900 py-8 grid grid-cols-2">
                                            <div>
                                                <span className="block text-slate-400 text-xs mb-1">FROM</span>
                                                <p className="font-bold">Acme Corp</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-slate-400 text-xs mb-1">TO</span>
                                                <p className="font-bold">Globex Corp</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between py-2 border-b border-slate-100">
                                                <span>Web Services</span>
                                                <span>₹10,000</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-slate-100">
                                                <span>Hosting</span>
                                                <span>₹2,450</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-4 font-bold text-lg">
                                            <span>TOTAL DUE</span>
                                            <span>₹14,691.00</span>
                                        </div>

                                        <div className="text-center pt-12 text-slate-400 text-xs">
                                            Thank you for your business.
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
