import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { createItem, getTaxCodes, getAccounts } from "@/api/masters";

// Schema
const formSchema = z.object({
    // Identification
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Item Code/SKU is required"),
    description: z.string().optional(),

    // Classification
    type: z.coerce.number(), // 0=Stock, 1=NonStock, 2=Service

    // UOM
    baseUom: z.string().min(1, "UOM is required"),
    alternateUom: z.string().optional(),
    uomConversionFactor: z.coerce.number().optional(),

    // Inventory
    trackInventory: z.boolean().default(true),
    openingQuantity: z.coerce.number().min(0).default(0),
    openingRate: z.coerce.number().min(0).default(0),
    reorderLevel: z.coerce.number().min(0).default(0),

    // Pricing
    salesPrice: z.coerce.number().min(0),
    purchasePrice: z.coerce.number().min(0),
    discountPercentage: z.coerce.number().min(0).max(100).default(0),

    // Tax
    taxCodeId: z.string().optional(),
    hsnSacCode: z.string().optional(),
    taxInclusive: z.boolean().default(false),
    taxRate: z.coerce.number().default(0),

    // Ledger
    purchaseLedgerId: z.string().optional(),
    salesLedgerId: z.string().optional(),
    inventoryLedgerId: z.string().optional(),

    // Control
    batchTracking: z.boolean().default(false),
    serialTracking: z.boolean().default(false),
    expiryTracking: z.boolean().default(false),
    barcode: z.string().optional(),
    manufacturerCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MaterialFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("general");

    // Queries
    const { data: taxCodes = [] } = useQuery({ queryKey: ["tax-codes"], queryFn: getTaxCodes });
    const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });

    // Filter Accounts
    const salesAccounts = accounts.filter(a => a.type === 30 || a.type === 31); // Income
    const purchaseAccounts = accounts.filter(a => a.type === 40 || a.type === 41); // Expense
    const inventoryAccounts = accounts.filter(a => a.type === 15); // Inventory Asset

    const form = useForm<any>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            description: "",
            type: 0, // Stock
            baseUom: "Nos",
            trackInventory: true,
            openingQuantity: 0,
            openingRate: 0,
            reorderLevel: 0,
            salesPrice: 0,
            purchasePrice: 0,
            discountPercentage: 0,
            taxInclusive: false,
            taxRate: 0,
            batchTracking: false,
            serialTracking: false,
            expiryTracking: false,
        },
    });

    const watchTrackInventory = useWatch({ control: form.control, name: "trackInventory" });
    const watchType = useWatch({ control: form.control, name: "type" });

    const mutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Item Created Successfully!");
            navigate("/masters/items");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create item");
        }
    });

    const onSubmit = (values: any) => {
        mutation.mutate(values);
    };

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">New Item</h2>
                        <p className="text-muted-foreground">Create a new product or service</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={mutation.isPending}>
                        {mutation.isPending ? "Saving..." : "Save Item"}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-white border w-full justify-start rounded-md h-12 p-1">
                            <TabsTrigger value="general" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">General Info</TabsTrigger>
                            <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700" disabled={watchType === 2}>Inventory</TabsTrigger>
                            <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Pricing & Tax</TabsTrigger>
                            <TabsTrigger value="accounting" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Accounting</TabsTrigger>
                        </TabsList>

                        {/* General Tab */}
                        <TabsContent value="general" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Item Type</FormLabel>
                                                <div className="flex gap-4">
                                                    <div className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1 ${field.value === 0 ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => field.onChange(0)}>
                                                        <div className="font-semibold">Goods (Stock)</div>
                                                        <div className="text-sm text-gray-500">Track inventory quantities</div>
                                                    </div>
                                                    <div className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex-1 ${field.value === 2 ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => field.onChange(2)}>
                                                        <div className="font-semibold">Service</div>
                                                        <div className="text-sm text-gray-500">Non-tangible items</div>
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Name*</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Code / SKU*</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="baseUom"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit of Measure (UOM)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select UOM" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Nos">Nos</SelectItem>
                                                        <SelectItem value="Kg">Kg</SelectItem>
                                                        <SelectItem value="Ltr">Ltr</SelectItem>
                                                        <SelectItem value="Mtr">Mtr</SelectItem>
                                                        <SelectItem value="Box">Box</SelectItem>
                                                        <SelectItem value="Pcs">Pcs</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} className="min-h-[100px]" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="manufacturerCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Manufacturer Code</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="MPN" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="barcode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Barcode / EAN</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Tracking</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="trackInventory"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Track Inventory for this item</FormLabel>
                                                    <FormDescription>
                                                        Enabling this will track stock movements and valuation.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {watchTrackInventory && (
                                        <>
                                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                                <FormField
                                                    control={form.control}
                                                    name="openingQuantity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Opening Stock</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="openingRate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Opening Rate (Per Unit)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="reorderLevel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Reorder Level</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormDescription>Alert when stock falls below this level</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Separator />

                                            <div className="grid grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="batchTracking"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                            <FormLabel>Enable Batch Tracking</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="serialTracking"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                            <FormLabel>Enable Serial Tracking</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="expiryTracking"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                            <FormLabel>Enable Expiry Tracking</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pricing & Tax Tab */}
                        <TabsContent value="pricing" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="salesPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Selling Price*</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="purchasePrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cost Price*</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discountPercentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Default Discount (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tax Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="taxCodeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tax Code</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Tax" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {taxCodes.map((tc: any) => (
                                                            <SelectItem key={tc.id} value={tc.id}>{tc.name} ({tc.rate}%)</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hsnSacCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>HSN/SAC Code</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="taxInclusive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-8">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel>Price is Tax Inclusive</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Accounting Tab */}
                        <TabsContent value="accounting" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ledger Mapping</CardTitle>
                                    <p className="text-sm text-muted-foreground">Map this item to specific accounts for posting transactions.</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="salesLedgerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sales Account (Income)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Income Account" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {salesAccounts.map(a => (
                                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="purchaseLedgerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Purchase Account (Expense)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Expense Account" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {purchaseAccounts.map(a => (
                                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {watchTrackInventory && (
                                        <FormField
                                            control={form.control}
                                            name="inventoryLedgerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Inventory Account (Asset)</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Inventory Account" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {inventoryAccounts.map(a => (
                                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}
