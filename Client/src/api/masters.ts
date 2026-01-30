import client from './client';

// Types
export interface Company {
    id: string;
    name: string;
    taxId: string;
    currency: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    panNumber: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
    booksOpeningDate: string;
    industry: string;
    companyType: string;
    enableGST: boolean;
    enableTDS: boolean;
}

export interface CreateCompanyDto {
    name: string;
    taxId: string;
    currency: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    panNumber: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
    booksOpeningDate: string;
    industry: string;
    companyType: string;
    enableGST: boolean;
    enableTDS: boolean;
}

// Companies API
export const getCompanies = async () => {
    const response = await client.get<Company[]>('/companies');
    return response.data;
};

export const createCompany = async (data: CreateCompanyDto) => {
    const response = await client.post('/companies', data);
    return response.data;
};

// Accounts API
export interface Account {
    id: string;
    name: string;
    code: string;
    type: number; // Enum
    parentAccountId?: string;
    isActive: boolean;
    description?: string;
    openingBalance?: number;
}

export interface CreateAccountDto {
    name: string;
    code: string;
    type: number;
    parentAccountId?: string;
    description?: string;
    openingBalance?: number;
    isActive?: boolean;
}

export const getAccounts = async () => {
    const response = await client.get<Account[]>('/accounts');
    return response.data;
};

export const createAccount = async (data: CreateAccountDto) => {
    const response = await client.post('/accounts', data);
    return response.data;
};

export const updateAccount = async (id: string, data: CreateAccountDto) => {
    const response = await client.put(`/accounts/${id}`, data);
    return response.data;
};

export const deleteAccount = async (id: string) => {
    await client.delete(`/accounts/${id}`);
};

// Items API
export interface ItemDto {
    id: string;
    code: string;
    name: string;
    description: string;
    type: string; // Stock, NonStock, Service

    // Grouping
    itemGroupId?: string;
    brandId?: string;

    // UOM
    baseUom: string;
    alternateUom?: string;
    uomConversionFactor?: number;

    // Inventory
    trackInventory: boolean;
    openingQuantity: number;
    openingRate: number;
    openingValue: number;
    reorderLevel: number;
    currentStock: number;

    // Pricing
    salesPrice: number;
    purchasePrice: number;
    discountPercentage: number;

    // Tax
    taxCodeId?: string;
    hsnSacCode?: string;
    taxInclusive: boolean;
    taxRate: number;

    // Accounts
    purchaseLedgerId?: string;
    salesLedgerId?: string;
    inventoryLedgerId?: string;

    // Control
    batchTracking: boolean;
    serialTracking: boolean;
    expiryTracking: boolean;
    barcode?: string;
    manufacturerCode?: string;

    isActive: boolean;
}

export interface CreateItemDto {
    code: string;
    name: string;
    description: string;
    category?: string;
    type: number; // 0=Stock, 1=NonStock, 2=Service

    itemGroupId?: string;
    brandId?: string;

    baseUom: string;
    alternateUom?: string;
    uomConversionFactor?: number;

    trackInventory: boolean;
    openingQuantity: number;
    openingRate: number;

    reorderLevel: number;

    salesPrice: number;
    purchasePrice: number;
    discountPercentage: number;

    taxCodeId?: string;
    hsnSacCode?: string;
    taxInclusive: boolean;
    taxRate: number;

    purchaseLedgerId?: string;
    salesLedgerId?: string;
    inventoryLedgerId?: string;

    batchTracking: boolean;
    serialTracking: boolean;
    expiryTracking: boolean;
    barcode?: string;
    manufacturerCode?: string;
}

export type Item = ItemDto;

export const getItems = async () => {
    const response = await client.get<ItemDto[]>('/items');
    return response.data;
};

export const createItem = async (data: CreateItemDto) => {
    const response = await client.post('/items', data);
    return response.data;
};

// Parties API
export interface Party {
    id: string;
    name: string;
    displayName: string;
    type: number; // Enum
    contactPerson: string;
    email: string;
    phone: string;
    mobile: string;
    gstIn?: string;
    panNumber?: string;
    billingAddress: string;
    billingCity: string;
    billingState: string;
    billingCountry: string;
    billingPincode: string;
    billingAttention?: string;
    billingStreet2?: string;
    billingPhone?: string;
    billingFax?: string;
    shippingAddress: string;
    shippingCity?: string;
    shippingState?: string;
    shippingCountry?: string;
    shippingPincode?: string;
    shippingAttention?: string;
    shippingStreet2?: string;
    shippingPhone?: string;
    shippingFax?: string;
    creditLimit: number;
    openingBalance: number;
    notes: string;
    isActive: boolean;
    salutation?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    website?: string;
    skypeName?: string;
    designation?: string;
    department?: string;
    twitter?: string;
    facebook?: string;
    gstTreatment?: string;
    aadhaarNumber?: string;
    placeOfSupply?: string;
    taxPreference?: string;
    currency?: string;
    priceListId?: string;
    portalEnabled?: boolean;
    portalLanguage?: string;
    paymentTermId?: number;
    contactPersons?: ContactPersonDto[];
}

export interface CreatePartyDto {
    name: string;
    displayName?: string;
    type: number;
    contactPerson: string;
    email: string;
    phone: string;
    mobile?: string;
    billingAttention?: string;
    billingAddress?: string;
    billingStreet2?: string;
    billingCity?: string;
    billingState?: string;
    billingCountry?: string;
    billingPincode?: string;
    billingPhone?: string;
    billingFax?: string;

    shippingAttention?: string;
    shippingAddress?: string;
    shippingStreet2?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingCountry?: string;
    shippingPincode?: string;
    shippingPhone?: string;
    shippingFax?: string;
    gstIn?: string;
    panNumber?: string;
    openingBalance?: number;
    creditLimit?: number;
    paymentTermId?: string | number;
    tdsCategoryId?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    notes?: string;
    salutation?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    website?: string;
    skypeName?: string;
    designation?: string;
    department?: string;
    twitter?: string;
    facebook?: string;
    gstTreatment?: string;
    aadhaarNumber?: string;
    placeOfSupply?: string;
    taxPreference?: string;
    currency?: string;
    priceListId?: string;
    portalEnabled?: boolean;
    portalLanguage?: string;
    contactPersons?: ContactPersonDto[];
}

export interface ContactPersonDto {
    salutation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    workPhone?: string;
    mobile?: string;
}

export const getParties = async () => {
    const response = await client.get<Party[]>('/parties');
    return response.data;
};

export const createParty = async (data: CreatePartyDto) => {
    const response = await client.post('/parties', data);
    return response.data;
};

export const getParty = async (id: string) => {
    const response = await client.get<Party>(`/parties/${id}`);
    return response.data;
};

export const updateParty = async (id: string, data: CreatePartyDto) => {
    const response = await client.put(`/parties/${id}`, data);
    return response.data;
};

// Items API (Previously defined above)

// Payment Terms
export interface PaymentTerm {
    id: number;
    name: string;
    days: number;
    description: string;
    isActive: boolean;
}

export interface CreatePaymentTermRequest {
    name: string;
    days: number;
    description: string;
    isActive: boolean;
}

export const getPaymentTerms = async (): Promise<PaymentTerm[]> => {
    const response = await client.get("/paymentterms");
    return response.data;
};

export const createPaymentTerm = async (data: CreatePaymentTermRequest): Promise<number> => {
    const response = await client.post("/paymentterms", data);
    return response.data;
};

// Numbering Series
export const ResetFrequency = {
    Never: 0,
    Yearly: 1,
    Monthly: 2
} as const;

export type ResetFrequency = typeof ResetFrequency[keyof typeof ResetFrequency];

export interface NumberingSeries {
    id: number;
    entityName: string;
    prefix: string;
    startingNumber: number;
    lastUsedNumber: number;
    suffix: string;
    paddingLength: number;
    resetFrequency: number;
    isActive: boolean;
    isDefault: boolean;
    preview: string;
}

export interface CreateNumberingSeriesRequest {
    entityName: string;
    prefix: string;
    startingNumber: number;
    suffix: string;
    paddingLength: number;
    resetFrequency: number;
    isDefault: boolean;
    isActive: boolean;
}

export const getNumberingSeries = async (): Promise<NumberingSeries[]> => {
    const response = await client.get("/numberingseries");
    return response.data;
};

export const createNumberingSeries = async (data: CreateNumberingSeriesRequest): Promise<number> => {
    const response = await client.post("/numberingseries", data);
    return response.data;
};

// Tax Codes API
export const TaxType = {
    GstOutput: 0,
    GstInput: 1,
    SalesTax: 2,
    Vat: 3,
    Other: 4
} as const;

export type TaxType = typeof TaxType[keyof typeof TaxType];

export interface TaxCode {
    id: string;
    name: string;
    code: string;
    rate: number;
    isTds: boolean;
    taxType: TaxType;
    payableAccountId?: string;
    receivableAccountId?: string;
    description: string;
    isActive: boolean;
}

export interface CreateTaxCodeDto {
    name: string;
    code: string;
    rate: number;
    isTds: boolean;
    taxType: TaxType;
    payableAccountId?: string;
    receivableAccountId?: string;
    description?: string;
    isActive?: boolean;
}

export interface TdsCategory {
    id: string;
    code: string;
    name: string;
    rate: number;
    thresholdAmount: number;
    description: string;
    isActive: boolean;
}

export interface CreateTdsCategoryDto {
    code: string;
    name: string;
    rate: number;
    thresholdAmount: number;
    description?: string;
    isActive?: boolean;
}

export const getTaxCodes = async () => {
    const response = await client.get<TaxCode[]>('/taxcodes');
    return response.data;
};

export const createTaxCode = async (data: CreateTaxCodeDto) => {
    const response = await client.post('/taxcodes', data);
    return response.data;
};

export async function getTdsCategories(): Promise<TdsCategory[]> {
    const response = await client.get<TdsCategory[]>('/tdscategories');
    return response.data;
}

export async function createTdsCategory(data: CreateTdsCategoryDto): Promise<string> {
    const response = await client.post<string>('/tdscategories', data);
    return response.data;
};
// Invoice Templates
export interface InvoiceTemplate {
    id: number;
    name: string;
    layout: string;
    primaryColor: string;
    accentColor: string;
    headerText: string;
    footerText: string;
    showBankDetails: boolean;
    logo: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface CreateInvoiceTemplateRequest {
    name: string;
    layout: string;
    primaryColor: string;
    accentColor: string;
    headerText: string;
    footerText: string;
    showBankDetails: boolean;
    logo: string;
    isDefault: boolean;
    isActive: boolean;
}

export const getInvoiceTemplates = async (): Promise<InvoiceTemplate[]> => {
    const response = await client.get("/InvoiceTemplates");
    return response.data;
};

export const createInvoiceTemplate = async (data: CreateInvoiceTemplateRequest): Promise<number> => {
    const response = await client.post("/InvoiceTemplates", data);
    return response.data;
};
