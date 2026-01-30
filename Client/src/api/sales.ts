import client from './client';

export interface SalesOrderItemDto {
    id: string;
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    quantityDelivered?: number;
    quantityInvoiced?: number;
}

export interface SalesOrderDto {
    id: string;
    orderNumber: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    customerId: string;
    customerName: string;
    customerPONumber?: string;
    deliveryAddress?: string;
    paymentTerms?: string;
    totalAmount: number;
    status: string;
    sentAt?: string;
    viewedAt?: string;
    approvalStatus?: string;
    placeOfSupply?: string;
    salesperson?: string;
    shippingCharges?: number;
    adjustment?: number;
    customerNotes?: string;
    termsAndConditions?: string;
    orderType: string;
    items: SalesOrderItemDto[];
}

export interface CreateSalesOrderItemDto {
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export interface CreateSalesOrderDto {
    customerId: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    customerPONumber?: string;
    deliveryAddress?: string;
    paymentTerms?: string;
    placeOfSupply?: string;
    salesperson?: string;
    shippingCharges?: number;
    adjustment?: number;
    customerNotes?: string;
    termsAndConditions?: string;
    orderType: string;
    items: CreateSalesOrderItemDto[];
}

export const getSalesOrders = async () => {
    const response = await client.get<SalesOrderDto[]>('/salesorders');
    return response.data;
};

export const getSalesOrderById = async (id: string) => {
    const response = await client.get<SalesOrderDto>(`/salesorders/${id}`);
    return response.data;
};

export const createSalesOrder = async (data: CreateSalesOrderDto) => {
    const response = await client.post<string>('/salesorders', data);
    return response.data;
};

export const updateSalesOrder = async (id: string, data: CreateSalesOrderDto) => {
    await client.put(`/salesorders/${id}`, data);
};

export interface SendOrderRequest {
    to?: string;
    subject?: string;
    body?: string;
}

export const sendSalesOrder = async (id: string, data?: SendOrderRequest) => {
    await client.post(`/salesorders/${id}/send`, data);
};

export const getPublicSalesOrder = async (token: string) => {
    const response = await client.get<SalesOrderDto>(`/salesorders/public/${token}`);
    return response.data;
};

export const respondToSalesOrder = async (data: { token: string; action: number; reason?: string }) => {
    await client.post(`/salesorders/public/${data.token}/respond`, data);
};

// Delivery Challans

export interface DeliveryChallan {
    id: string;
    challanNumber: string;
    challanDate: string;
    customerId: string;
    customerName: string;
    salesOrderId?: string;
    salesOrderNumber?: string;
    deliveryAddress?: string;
    vehicleNumber?: string;
    eWayBillNumber?: string;
    purpose: string;
    referenceNumber?: string;
    placeOfSupply?: string;
    challanType?: string;
    subTotal: number;
    taxAmount: number;
    adjustment: number;
    roundOff: number;
    totalAmount: number;
    status: string;
    notes?: string;
    lines: DeliveryChallanLine[];
}

export interface DeliveryChallanLine {
    id?: string;
    itemId: string;
    itemName?: string;
    description: string;
    orderedQuantity: number;
    deliveredQuantity: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    amount: number;
    salesOrderItemId?: string;
}

export const getDeliveryChallans = async (): Promise<DeliveryChallan[]> => {
    const response = await client.get("/deliverychallans");
    return response.data;
};

export const getDeliveryChallanById = async (id: string): Promise<DeliveryChallan> => {
    const response = await client.get(`/deliverychallans/${id}`);
    return response.data;
};

export const createDeliveryChallan = async (data: Partial<DeliveryChallan>): Promise<string> => {
    const response = await client.post("/deliverychallans", data);
    return response.data;
};

export interface PendingDeliveryChallanLineDto {
    id: string; // DC Line Id
    itemId: string;
    itemName: string;
    description: string;
    quantity: number; // Remaining
    rate: number;
    taxRate: number;
    salesOrderItemId?: string;
}

export interface PendingDeliveryChallanDto {
    id: string;
    challanNumber: string;
    challanDate: string;
    referenceNumber: string;
    salesOrderId?: string;
    salesOrderNumber?: string;
    lines: PendingDeliveryChallanLineDto[];
}

export const getPendingDeliveryChallans = async (customerId: string) => {
    const response = await client.get<PendingDeliveryChallanDto[]>(`/deliverychallans/pending?customerId=${customerId}`);
    return response.data;
};

// Credit Notes

export interface CreditNote {
    id: string;
    creditNoteNumber: string;
    creditNoteDate: string;
    customerId: string;
    customerName: string;
    invoiceId?: string;
    invoiceNumber?: string;
    reason?: string;
    totalAmount: number;
    status: string;
    lines: CreditNoteLine[];
}

export interface CreditNoteLine {
    id?: string;
    itemId: string;
    itemName?: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    amount?: number;
}

export const getCreditNotes = async (): Promise<CreditNote[]> => {
    const response = await client.get("/creditnotes");
    return response.data;
};

export const getCreditNoteById = async (id: string): Promise<CreditNote> => {
    const response = await client.get(`/creditnotes/${id}`);
    return response.data;
};

export const createCreditNote = async (data: Partial<CreditNote>): Promise<string> => {
    const response = await client.post("/creditnotes", data);
    return response.data;
};

// Invoices
export interface InvoiceLineDto {
    id: string;
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    amount: number;
}

export interface InvoiceDto {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    customerId: string;
    customerName: string;
    salesOrderId?: string;
    salesOrderNumber?: string;
    referenceNumber?: string;
    placeOfSupply?: string;
    paymentTerms?: string;
    salesperson?: string;
    customerNotes?: string;
    termsAndConditions?: string;
    subTotal: number;
    shippingCharges: number;
    adjustment: number;
    roundOff: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
    items: InvoiceLineDto[];
}

export interface CreateInvoiceLineDto {
    itemId: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    salesOrderItemId?: string;
}

export interface CreateInvoiceDto {
    customerId: string;
    salesOrderId?: string;
    invoiceDate: string;
    dueDate: string;
    referenceNumber?: string;
    placeOfSupply?: string;
    paymentTerms?: string;
    salesperson?: string;
    customerNotes?: string;
    termsAndConditions?: string;
    shippingCharges: number;
    adjustment: number;
    roundOff: number;
    items: CreateInvoiceLineDto[];
}

export const getInvoices = async () => {
    const response = await client.get<InvoiceDto[]>('/invoices');
    return response.data;
};

// Estimates
export interface EstimateItemDto {
    id: string;
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    amount: number;
}

export interface EstimateDto {
    id: string;
    estimateNumber: string;
    referenceNumber?: string;
    estimateDate: string;
    expiryDate: string;
    customerId: string;
    customerName: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    termsAndConditions?: string;
    customerNotes?: string;
    publicViewToken?: string;
    placeOfSupply?: string;
    salesperson?: string;
    projectName?: string;
    shippingCharges?: number;
    adjustment?: number;
    negotiationAllowed?: boolean;
    customerRemarks?: string;
    items: EstimateItemDto[];
}

export interface CreateEstimateItemDto {
    itemId: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
}

export interface CreateEstimateDto {
    customerId: string;
    referenceNumber?: string;
    estimateDate: string;
    expiryDate: string;
    customerNotes?: string;
    termsAndConditions?: string;

    placeOfSupply?: string;
    salesperson?: string;
    projectName?: string;
    shippingCharges?: number;
    adjustment?: number;
    negotiationAllowed?: boolean;

    items: CreateEstimateItemDto[];
}

export const getEstimates = async () => {
    const response = await client.get<EstimateDto[]>('/estimates');
    return response.data;
};

export const createEstimate = async (data: CreateEstimateDto) => {
    const response = await client.post<string>('/estimates', data);
    return response.data;
};

export const getEstimateById = async (id: string) => {
    const response = await client.get<EstimateDto>(`/estimates/${id}`);
    return response.data;
};

export const updateEstimate = async (id: string, data: CreateEstimateDto) => {
    await client.put(`/estimates/${id}`, data);
};

export const sendEstimate = async (id: string) => {
    await client.post(`/estimates/${id}/send`);
};

export const getPublicEstimate = async (token: string) => {
    const response = await client.get<EstimateDto>(`/estimates/public/${token}`);
    return response.data;
};

export const respondToEstimate = async (data: { token: string; action: number; reason?: string }) => {
    await client.post('/estimates/public/respond', data);
};

export const submitNegotiation = async (id: string, data: { publicToken: string; proposedEstimate: CreateEstimateDto }) => {
    await client.post(`/estimates/${id}/negotiate`, data);
};

export const convertToOrder = async (id: string, data: { publicToken: string }) => {
    const response = await client.post<string>(`/estimates/${id}/convert-to-order`, data);
    return response.data;
};



export const createInvoice = async (data: CreateInvoiceDto) => {
    const response = await client.post<string>('/invoices', data);
    return response.data;
};

export interface EstimateVersionDto {
    id: string;
    estimateId: string;
    versionNumber: number;
    createdAt: string;
    createdBy: string;
    snapshotJson: string;
    changesSummary: string;
}

export const getEstimateVersions = async (id: string) => {
    const response = await client.get<EstimateVersionDto[]>(`/estimates/${id}/versions`);
    return response.data;
};


// Recurring Invoices

export interface RecurringInvoiceItemDto {
    id: string;
    itemId: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    amount: number;
}

export interface RecurringInvoiceDto {
    id: string;
    profileName: string;
    customerId: string;
    customerName: string;
    interval: string;
    startDate: string;
    endDate?: string;
    lastRunDate?: string;
    nextRunDate: string;
    status: string;
    paymentTerms: string;
    totalAmount: number;
    items: RecurringInvoiceItemDto[];
}

export interface CreateRecurringInvoiceItemDto {
    itemId: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
}

export interface CreateRecurringInvoiceDto {
    profileName: string;
    customerId: string;
    recurringInterval: string; // "Daily", "Weekly", "Monthly"
    startDate: string;
    endDate?: string;
    paymentTerms?: string;
    items: CreateRecurringInvoiceItemDto[];
}

export const getRecurringInvoices = async () => {
    const response = await client.get<RecurringInvoiceDto[]>('/recurringinvoices');
    return response.data;
};


export const createRecurringInvoice = async (data: CreateRecurringInvoiceDto) => {
    const response = await client.post<string>('/recurringinvoices', data);
    return response.data;
};

// Approval Actions
export const approveSalesOrder = async (id: string) => {
    await client.post(`/salesorders/${id}/approve`);
};

export const approveEstimate = async (id: string) => {
    await client.post(`/estimates/${id}/approve`);
};

export const approveDeliveryChallan = async (id: string) => {
    await client.post(`/deliverychallans/${id}/approve`);
};

export const approveInvoice = async (id: string) => {
    await client.post(`/invoices/${id}/approve`);
};
