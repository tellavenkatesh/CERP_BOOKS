import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCompany } from '@/api/masters';

const formSchema = z.object({
    name: z.string().min(2, "Company Name is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    pincode: z.string().min(5, "Pincode is required"),
    phone: z.string().default(""),
    email: z.string().email().or(z.literal("")).default(""),
    website: z.string().default(""),
    taxId: z.string().default(""),
    panNumber: z.string().default(""),
    currency: z.string().default("INR"),
    industry: z.string().default(""),
    companyType: z.string().default(""),
    fiscalYearStart: z.string().min(1, "Start Date is required"),
    fiscalYearEnd: z.string().min(1, "End Date is required"),
    booksOpeningDate: z.string().min(1, "Books Opening Date is required"),
    enableGST: z.boolean().default(false),
    enableTDS: z.boolean().default(false),
});



export default function CompanySetup() {
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            address: "",
            city: "",
            state: "",
            country: "India",
            pincode: "",
            phone: "",
            email: "",
            website: "",
            taxId: "",
            panNumber: "",
            currency: "INR",
            industry: "Retail",
            companyType: "Proprietorship",
            fiscalYearStart: `${new Date().getFullYear()}-04-01`,
            fiscalYearEnd: `${new Date().getFullYear() + 1}-03-31`,
            booksOpeningDate: format(new Date(), "yyyy-MM-dd"),
            enableGST: true,
            enableTDS: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createCompany({
                ...values,
                phone: values.phone || "",
                email: values.email || "",
                website: values.website || "",
                taxId: values.taxId || "",
                panNumber: values.panNumber || "",
                industry: values.industry || "",
                companyType: values.companyType || "",
            });
            // Proceed to next step
            navigate('/setup/opening-balances');
        } catch (error) {
            console.error(error);
            // Handle error (toast)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome! Let's set up your company</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Section 1: Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Company Information</CardTitle>
                            <CardDescription>Basic details about your business.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
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

                    {/* Section 2: Business & Tax Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Business & Tax Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Industry</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Industry" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Retail">Retail</SelectItem>
                                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                                <SelectItem value="Services">Services</SelectItem>
                                                <SelectItem value="Tech">Technology</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="companyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                                                <SelectItem value="Partnership">Partnership</SelectItem>
                                                <SelectItem value="Private Limited">Private Limited</SelectItem>
                                                <SelectItem value="LLP">LLP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
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
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
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
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Enable TDS</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Section 3: Financial Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>3. Financial Year & Currency</CardTitle>
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

                    <Button type="submit" className="w-full">Save & Continue</Button>
                </form>
            </Form>
        </div>
    );
}
