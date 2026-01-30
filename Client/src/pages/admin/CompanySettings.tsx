import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompanySettings, updateCompanySettings, type CompanySettings as CompanySettingsType } from '@/api/admin';
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2, "Company Name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    pincode: z.string().min(5, "Pincode is required"),
    phone: z.string(),
    email: z.string(), // simplified email validation to avoid complexity with optional emails
    website: z.string(),
    taxId: z.string(),
    panNumber: z.string(),
    currency: z.string().default("INR"), // Keep default for currency as it has a meaningful default
    industry: z.string(),
    companyType: z.string(),
    fiscalYearStart: z.string().min(1, "Start Date is required"),
    fiscalYearEnd: z.string().min(1, "End Date is required"),
    booksOpeningDate: z.string().min(1, "Books Opening Date is required"),
    enableGST: z.boolean().default(false),
    enableTDS: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanySettings() {
    const [loading, setLoading] = useState(true);

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            address: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
            phone: "",
            email: "",
            website: "",
            taxId: "",
            panNumber: "",
            currency: "INR",
            industry: "",
            companyType: "",
            fiscalYearStart: `${new Date().getFullYear()}-04-01`,
            fiscalYearEnd: `${new Date().getFullYear() + 1}-03-31`,
            booksOpeningDate: format(new Date(), "yyyy-MM-dd"),
            enableGST: false,
            enableTDS: false,
        },
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getCompanySettings();
            if (data) {
                // Format dates to YYYY-MM-DD for input type="date"
                const formattedData = {
                    name: data.name || "",
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    country: data.country || "",
                    pincode: data.pincode || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    website: data.website || "",
                    taxId: data.taxId || "",
                    panNumber: data.panNumber || "",
                    currency: data.currency || "INR",
                    industry: data.industry || "",
                    companyType: data.companyType || "",
                    fiscalYearStart: data.fiscalYearStart ? new Date(data.fiscalYearStart).toISOString().split('T')[0] : "",
                    fiscalYearEnd: data.fiscalYearEnd ? new Date(data.fiscalYearEnd).toISOString().split('T')[0] : "",
                    booksOpeningDate: data.booksOpeningDate ? new Date(data.booksOpeningDate).toISOString().split('T')[0] : "",
                    enableGST: !!data.enableGST,
                    enableTDS: !!data.enableTDS,
                };
                form.reset(formattedData);
            }
        } catch (error) {
            console.error("Failed to load settings", error);
            toast.error("Failed to load company settings");
        } finally {
            setLoading(false);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateCompanySettings(values as CompanySettingsType);
            toast.success("Company settings updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        }
    }

    if (loading) {
        return <div className="p-10">Loading settings...</div>;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Company Settings</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="company" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="company">Company Info</TabsTrigger>
                            <TabsTrigger value="fiscal">Fiscal Year</TabsTrigger>
                            <TabsTrigger value="tax">Tax Configuration</TabsTrigger>
                            <TabsTrigger value="branding">Branding</TabsTrigger>
                        </TabsList>

                        {/* COMPANY INFO */}
                        <TabsContent value="company">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Information</CardTitle>
                                    <CardDescription>Basic details about your business.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Company Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input type="email" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Address</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pincode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pincode</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* FISCAL YEAR */}
                        <TabsContent value="fiscal">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Year & Currency</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fiscalYearStart"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fiscal Year Start</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fiscalYearEnd"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fiscal Year End</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="booksOpeningDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Books Opening Date</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAX CONFIG */}
                        <TabsContent value="tax">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tax Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="taxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GSTIN</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="panNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PAN Number</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="enableGST"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Enable GST</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="enableTDS"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Enable TDS</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* BRANDING */}
                        <TabsContent value="branding">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Logo & Branding</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-10">
                                        <p className="text-muted-foreground mb-4">Upload Company Logo</p>
                                        <Button type="button" variant="secondary">Choose File</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                    <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

