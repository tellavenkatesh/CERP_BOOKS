import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { createParty, updateParty, getParty, getPaymentTerms, type CreatePartyDto, type PaymentTerm } from '@/api/masters';
import PaymentTermsDialog from '@/components/masters/PaymentTermsDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const formSchema = z.object({
    // Type - Vendor is usually business, but can be individual. Keeping same as customer for consistency.
    vendorType: z.enum(['business', 'individual']),

    // Primary Info
    salutation: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    displayName: z.string().min(1, 'Display Name is required'),
    email: z.string().email().or(z.literal('')).optional(),
    workPhone: z.string().optional(),
    mobile: z.string().optional(),
    website: z.string().optional(),

    // Address
    billingAttention: z.string().optional(),
    billingAddress: z.string().optional(), // Street 1
    billingStreet2: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingCountry: z.string().optional(),
    billingPincode: z.string().optional(),
    billingPhone: z.string().optional(),
    billingFax: z.string().optional(),


    shippingAttention: z.string().optional(),
    shippingAddress: z.string().optional(), // Street 1
    shippingStreet2: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingState: z.string().optional(),
    shippingCountry: z.string().optional(),
    shippingPincode: z.string().optional(),
    shippingPhone: z.string().optional(),
    shippingFax: z.string().optional(),

    // Other Details
    gstTreatment: z.string().min(1, 'GST Treatment is required'),
    gstIn: z.string().optional(),
    panNumber: z.string().optional(),
    placeOfSupply: z.string().min(1, 'Place of Supply is required'),
    taxPreference: z.string().min(1, 'Tax Preference is required'),
    currency: z.string().optional(),
    openingBalance: z.string().optional(),
    paymentTermId: z.string().optional(),
    priceListId: z.string().optional(),

    // Social / Contact
    skypeName: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),

    portalEnabled: z.boolean().optional(),
    portalLanguage: z.string().optional(),

    remarks: z.string().optional(),
    contactPersons: z.array(z.object({
        salutation: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        workPhone: z.string().optional(),
        mobile: z.string().optional(),
    })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VendorFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentTermsDialog, setShowPaymentTermsDialog] = useState(false);

    const { id } = useParams();
    const isEditMode = !!id;

    const { data: existingParty, isLoading: isLoadingParty } = useQuery({
        queryKey: ['party', id],
        queryFn: () => getParty(id!),
        enabled: isEditMode,
    });

    const { data: paymentTerms = [] } = useQuery({
        queryKey: ['paymentTerms'],
        queryFn: getPaymentTerms,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vendorType: 'business',
            salutation: '',
            firstName: '',
            lastName: '',
            companyName: '',
            displayName: '',
            email: '',
            workPhone: '',
            mobile: '',
            website: '',


            billingAttention: '',
            billingAddress: '',
            billingStreet2: '',
            billingCity: '',
            billingState: '',
            billingCountry: 'India',
            billingPincode: '',
            billingPhone: '',
            billingFax: '',

            shippingAttention: '',
            shippingAddress: '',
            shippingStreet2: '',
            shippingCity: '',
            shippingState: '',
            shippingCountry: 'India',
            shippingPincode: '',
            shippingPhone: '',
            shippingFax: '',

            taxPreference: 'Taxable',
            currency: 'INR',
            portalEnabled: false,
            portalLanguage: 'English',
            contactPersons: [],
            gstTreatment: '',
            priceListId: '',
        },
    });

    // Reset form when existingParty loads
    const { reset } = form;

    // Using useEffect for reset
    useEffect(() => {
        if (existingParty) {
            reset({
                vendorType: existingParty.type === 1 ? 'business' : 'individual', // Note: Party Type 1 is Vendor
                companyName: existingParty.companyName || '',
                salutation: existingParty.salutation || '',
                firstName: existingParty.firstName || '',
                lastName: existingParty.lastName || '',
                displayName: existingParty.displayName || '',
                email: existingParty.email || '',
                workPhone: existingParty.phone || '',
                mobile: existingParty.mobile || '',
                website: existingParty.website || '',

                billingAttention: existingParty.billingAttention || '',
                billingAddress: existingParty.billingAddress || '',
                billingStreet2: existingParty.billingStreet2 || '',
                billingCity: existingParty.billingCity || '',
                billingState: existingParty.billingState || '',
                billingCountry: existingParty.billingCountry || 'India',
                billingPincode: existingParty.billingPincode || '',

                shippingAttention: existingParty.shippingAttention || '',
                shippingAddress: existingParty.shippingAddress || '',
                shippingStreet2: existingParty.shippingStreet2 || '',
                shippingCity: existingParty.shippingCity || '',
                shippingState: existingParty.shippingState || '',
                shippingCountry: existingParty.shippingCountry || 'India',
                shippingPincode: existingParty.shippingPincode || '',

                taxPreference: existingParty.taxPreference || 'Taxable',
                currency: existingParty.currency || 'INR',
                portalEnabled: existingParty.portalEnabled || false,
                portalLanguage: existingParty.portalLanguage || 'English',
                gstTreatment: existingParty.gstTreatment || '',
                priceListId: existingParty.priceListId || '',
                gstIn: existingParty.gstIn || '',
                panNumber: existingParty.panNumber || '',
                placeOfSupply: existingParty.placeOfSupply || '',
                openingBalance: (existingParty.openingBalance || 0).toString(),
                paymentTermId: existingParty.paymentTermId?.toString() || '',

                skypeName: existingParty.skypeName || '',
                designation: existingParty.designation || '',
                department: existingParty.department || '',
                twitter: existingParty.twitter || '',
                facebook: existingParty.facebook || '',
                remarks: existingParty.notes || '',
            });
        }
    }, [existingParty, reset]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contactPersons",
    });

    const mutation = useMutation({
        mutationFn: createParty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            toast.success("Vendor created successfully");
            navigate('/masters/vendors');
        },
        onError: (err) => {
            toast.error("Failed to create vendor");
            console.error(err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreatePartyDto) => updateParty(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parties'] });
            queryClient.invalidateQueries({ queryKey: ['party', id] });
            toast.success("Vendor updated successfully");
            navigate('/masters/vendors');
        },
        onError: (err) => {
            toast.error("Failed to update vendor");
            console.error(err);
        }
    });

    function onSubmit(values: FormValues) {
        setIsSubmitting(true);

        // Map Form Values to DTO
        const dto: CreatePartyDto = {
            name: values.companyName || `${values.firstName || ''} ${values.lastName || ''}`.trim(), // Name field in DB
            displayName: values.displayName,
            type: 1, // Vendor

            // Person
            salutation: values.salutation || '',
            firstName: values.firstName || '',
            lastName: values.lastName || '',
            email: values.email || '',
            phone: values.workPhone || '',
            mobile: values.mobile || '',
            contactPerson: `${values.firstName || ''} ${values.lastName || ''}`.trim(),

            // Company
            companyName: values.companyName || '',
            website: values.website || '',
            department: values.department || '',
            designation: values.designation || '',

            // Address
            // Address
            billingAttention: values.billingAttention || '',
            billingAddress: values.billingAddress || '',
            billingStreet2: values.billingStreet2 || '',
            billingCity: values.billingCity || '',
            billingState: values.billingState || '',
            billingCountry: values.billingCountry || '',
            billingPincode: values.billingPincode || '',
            billingPhone: values.billingPhone || '',
            billingFax: values.billingFax || '',

            shippingAttention: values.shippingAttention || '',
            shippingAddress: values.shippingAddress || '',
            shippingStreet2: values.shippingStreet2 || '',
            shippingCity: values.shippingCity || '',
            shippingState: values.shippingState || '',
            shippingCountry: values.shippingCountry || '',
            shippingPincode: values.shippingPincode || '',
            shippingPhone: values.shippingPhone || '',
            shippingFax: values.shippingFax || '',

            // Tax / Financial
            gstTreatment: values.gstTreatment,
            gstIn: values.gstIn || '',
            panNumber: values.panNumber || '',
            placeOfSupply: values.placeOfSupply || '',
            taxPreference: values.taxPreference || '',
            currency: values.currency || '',
            openingBalance: parseFloat(values.openingBalance || '0'),
            paymentTermId: values.paymentTermId || undefined,
            priceListId: values.priceListId || undefined,

            // Social
            skypeName: values.skypeName || '',
            twitter: values.twitter || '',
            facebook: values.facebook || '',

            // Notes
            notes: values.remarks || '',

            // Portal
            portalEnabled: values.portalEnabled || false,
            portalLanguage: values.portalLanguage || 'English',

            // Contact Persons
            contactPersons: values.contactPersons || [],
        };

        if (isEditMode) {
            updateMutation.mutate(dto);
        } else {
            mutation.mutate(dto);
        }
    }

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{isEditMode ? 'Edit Vendor' : 'New Vendor'}</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Top Section: Basic Info */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="vendorType"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormLabel className="w-[150px]">Vendor Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex flex-row space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="business" /></FormControl>
                                                <FormLabel className="font-normal">Business</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl><RadioGroupItem value="individual" /></FormControl>
                                                <FormLabel className="font-normal">Individual</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-row gap-4 items-center">
                            <span className="w-[150px] text-sm font-medium">Primary Contact</span>
                            <div className="flex gap-2 flex-1 max-w-2xl">
                                <FormField control={form.control} name="salutation" render={({ field }) => (
                                    <FormItem className="w-[100px]">
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Salutation" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mr.">Mr.</SelectItem>
                                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                                <SelectItem value="Ms.">Ms.</SelectItem>
                                                <SelectItem value="Dr.">Dr.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem className="flex-1"><FormControl><Input placeholder="First Name" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem className="flex-1"><FormControl><Input placeholder="Last Name" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-4 space-y-0">
                                    <FormLabel className="w-[150px]">Company Name</FormLabel>
                                    <FormControl className="flex-1 max-w-md">
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-4 space-y-0">
                                    <FormLabel className="w-[150px] text-red-500">Vendor Display Name*</FormLabel>
                                    <FormControl className="flex-1 max-w-md">
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-row items-center gap-4">
                            <span className="w-[150px] text-sm font-medium">Vendor Email</span>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem className="flex-1 max-w-md"><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                        <div className="flex flex-row items-center gap-4">
                            <span className="w-[150px] text-sm font-medium">Vendor Phone</span>
                            <div className="flex gap-4 flex-1 max-w-2xl">
                                <FormField control={form.control} name="workPhone" render={({ field }) => (
                                    <FormItem className="flex-1"><FormControl><Input placeholder="Work Phone" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="mobile" render={({ field }) => (
                                    <FormItem className="flex-1"><FormControl><Input placeholder="Mobile" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-4">
                            <span className="w-[150px]"></span>
                            <div className="text-blue-600 text-sm cursor-pointer hover:underline">Add more details</div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <Tabs defaultValue="other" className="w-full mt-10">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                            <TabsTrigger value="other" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-2">Other Details</TabsTrigger>
                            <TabsTrigger value="address" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-2">Address</TabsTrigger>
                            <TabsContent value="contact" className="pt-6">
                                <div className="border rounded-md">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="p-2 w-[100px]">Salutation</th>
                                                <th className="p-2">First Name</th>
                                                <th className="p-2">Last Name</th>
                                                <th className="p-2">Email Address</th>
                                                <th className="p-2">Work Phone</th>
                                                <th className="p-2">Mobile</th>
                                                <th className="p-2 w-[50px]"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fields.map((field, index) => (
                                                <tr key={field.id} className="border-b last:border-0 group">
                                                    <td className="p-2 align-top">
                                                        <FormField control={form.control} name={`contactPersons.${index}.salutation`} render={({ field }) => (
                                                            <FormItem className="space-y-0"><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Mr">Mr.</SelectItem><SelectItem value="Mrs">Mrs.</SelectItem><SelectItem value="Ms">Ms.</SelectItem><SelectItem value="Dr">Dr.</SelectItem></SelectContent></Select></FormControl></FormItem>
                                                        )} />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <FormField control={form.control} name={`contactPersons.${index}.firstName`} render={({ field }) => (
                                                            <FormItem className="space-y-0"><FormControl><Input {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <FormField control={form.control} name={`contactPersons.${index}.lastName`} render={({ field }) => (
                                                            <FormItem className="space-y-0"><FormControl><Input {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <FormField control={form.control} name={`contactPersons.${index}.email`} render={({ field }) => (
                                                            <FormItem className="space-y-0"><FormControl><Input {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <FormField control={form.control} name={`contactPersons.${index}.workPhone`} render={({ field }) => (
                                                            <FormItem className="space-y-0"><FormControl><Input {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <FormField control={form.control} name={`contactPersons.${index}.mobile`} render={({ field }) => (
                                                            <FormItem className="space-y-0"><FormControl><Input {...field} /></FormControl></FormItem>
                                                        )} />
                                                    </td>
                                                    <td className="p-2 align-top text-center pt-3">
                                                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none">&times;</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="mt-2 pl-0 text-blue-600"
                                    onClick={() => append({ salutation: 'Mr', firstName: '', lastName: '', email: '', workPhone: '', mobile: '' })}
                                >
                                    + Add Contact Person
                                </Button>
                            </TabsContent>
                            <TabsTrigger value="custom" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-2">Custom Fields</TabsTrigger>
                            <TabsTrigger value="tags" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-2">Reporting Tags</TabsTrigger>
                            <TabsTrigger value="remarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 pb-2">Remarks</TabsTrigger>
                        </TabsList>

                        <TabsContent value="other" className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Card: Tax & Financials */}
                                <Card>
                                    <div className="p-4 font-semibold border-b">Tax & Financial Settings</div>
                                    <CardContent className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="gstTreatment" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Treatment <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select Treatment" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="registered_business_regular">Registered Business - Regular</SelectItem>
                                                            <SelectItem value="registered_business_composition">Registered Business - Composition</SelectItem>
                                                            <SelectItem value="unregistered_business">Unregistered Business</SelectItem>
                                                            <SelectItem value="consumer">Consumer</SelectItem>
                                                            <SelectItem value="overseas">Overseas</SelectItem>
                                                            <SelectItem value="special_economic_zone">Special Economic Zone</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="placeOfSupply" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Place Of Supply <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select Place" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="TN">[TN]-Tamil Nadu</SelectItem>
                                                            <SelectItem value="KA">[KA]-Karnataka</SelectItem>
                                                            <SelectItem value="KL">[KL]-Kerala</SelectItem>
                                                            <SelectItem value="MH">[MH]-Maharashtra</SelectItem>
                                                            <SelectItem value="DL">[DL]-Delhi</SelectItem>
                                                            <SelectItem value="AP">[AP]-Andhra Pradesh</SelectItem>
                                                            <SelectItem value="TG">[TG]-Telangana</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="panNumber" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PAN</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="gstIn" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GSTIN</FormLabel>
                                                    <FormControl><Input placeholder="16 char GSTIN" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="taxPreference" render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Tax Preference <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Taxable" id="taxable" /><label htmlFor="taxable">Taxable</label></div>
                                                        <div className="flex items-center space-x-2"><RadioGroupItem value="TaxExempt" id="exempt" /><label htmlFor="exempt">Tax Exempt</label></div>
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="currency" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Currency</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select Currency" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="INR">Indian Rupee</SelectItem>
                                                            <SelectItem value="USD">USD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="openingBalance" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Opening Balance</FormLabel>
                                                    <div className="flex rounded-md border border-input bg-transparent shadow-sm">
                                                        <div className="bg-muted px-3 py-2 border-r text-sm text-muted-foreground">INR</div>
                                                        <FormControl>
                                                            <Input type="text" {...field} className="border-0 shadow-none focus-visible:ring-0" />
                                                        </FormControl>
                                                    </div>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="paymentTermId" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Payment Terms</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            if (value === "configure_new_term") {
                                                                setShowPaymentTermsDialog(true);
                                                            } else {
                                                                field.onChange(value);
                                                            }
                                                        }}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Due on Receipt" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {paymentTerms.map((term: PaymentTerm) => (
                                                                <SelectItem key={term.id} value={term.id.toString()}>
                                                                    {term.name}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="configure_new_term" className="text-blue-600 font-medium cursor-pointer">
                                                                + Configure Payment Terms
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="priceListId" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price List</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select Price List" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="standard">Standard Price List</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right Card: General & Portal */}
                                <Card>
                                    <div className="p-4 font-semibold border-b">General & Portal Settings</div>
                                    <CardContent className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="department" render={({ field }) => (
                                                <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="designation" render={({ field }) => (
                                                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="website" render={({ field }) => (
                                            <FormItem><FormLabel>Website URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />

                                        <div className="p-4 bg-muted/20 rounded-md space-y-4 border">
                                            <div className="font-medium text-sm">Portal Access</div>
                                            <FormField control={form.control} name="portalEnabled" render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" /></FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Allow portal access for this vendor</FormLabel>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="portalLanguage" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Portal Language</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch('portalEnabled')}>
                                                        <FormControl>
                                                            <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="English">English</SelectItem>
                                                            <SelectItem value="Spanish">Spanish</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-medium">Documents</div>
                                            <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50/80 transition-colors cursor-pointer">
                                                <div className="p-2 bg-white rounded-full shadow-sm mb-2">
                                                    <Plus className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-medium text-blue-600 mb-1">Upload File</span>
                                                <p className="text-xs text-muted-foreground">Max 10 files, 10MB each</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <FormField control={form.control} name="skypeName" render={({ field }) => (
                                                <FormItem><FormLabel>Skype</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="twitter" render={({ field }) => (
                                                <FormItem><FormLabel>Twitter</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="facebook" render={({ field }) => (
                                                <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="address" className="pt-6">
                            <div className="grid grid-cols-2 gap-8">
                                <Card>
                                    <div className="p-4 font-semibold border-b">Billing Address</div>
                                    <CardContent className="space-y-4 pt-4">
                                        <FormField control={form.control} name="billingAttention" render={({ field }) => (<FormItem><FormLabel>Attention</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="billingAddress" render={({ field }) => (<FormItem><FormLabel>Street 1</FormLabel><FormControl><Textarea className="min-h-[80px]" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="billingStreet2" render={({ field }) => (<FormItem><FormLabel>Street 2</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="billingCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="billingState" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="billingPincode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="billingCountry" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="billingPhone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="billingFax" render={({ field }) => (<FormItem><FormLabel>Fax</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <div className="p-4 font-semibold border-b">Shipping Address</div>
                                    <CardContent className="space-y-4 pt-4">
                                        <FormField control={form.control} name="shippingAttention" render={({ field }) => (<FormItem><FormLabel>Attention</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="shippingAddress" render={({ field }) => (<FormItem><FormLabel>Street 1</FormLabel><FormControl><Textarea className="min-h-[80px]" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name="shippingStreet2" render={({ field }) => (<FormItem><FormLabel>Street 2</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="shippingCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="shippingState" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="shippingPincode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="shippingCountry" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="shippingPhone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name="shippingFax" render={({ field }) => (<FormItem><FormLabel>Fax</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="remarks" className="pt-6">
                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Remarks (Internal Use)</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-[150px]" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </TabsContent>
                    </Tabs>

                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-start gap-4 pl-[280px]">
                        {/* Adjust pl-[280px] to match sidebar width approx */}
                        <Button type="submit" disabled={isSubmitting || mutation.isPending}>Save</Button>
                        <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                    </div>
                    <div className="h-16"></div> {/* Spacer for fixed footer */}
                </form>
            </Form>

            <PaymentTermsDialog
                open={showPaymentTermsDialog}
                onOpenChange={setShowPaymentTermsDialog}
                onSelect={(term) => {
                    form.setValue('paymentTermId', term.id.toString());
                }}
            />
        </div>
    );
}
