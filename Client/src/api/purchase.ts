import client from './client';

// --- Purchase Requests ---
export interface PurchaseRequestItemDto {
    id: string;
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    estimatedRate: number;
    estimatedAmount: number;
}

export interface PurchaseRequestDto {
    id: string;
    requestNumber: string;
    requestDate: string;
    requiredDate?: string;
    requestedBy: string;
    reason: string;
    department: string;
    priority: number; // 0=Low, 1=Medium, 2=High
    status: string;
    approvedBy?: string;
    remarks?: string;
    items: PurchaseRequestItemDto[];
}

export interface CreatePurchaseRequestItemDto {
    itemId: string;
    description: string;
    quantity: number;
    estimatedRate: number;
}

export interface CreatePurchaseRequestDto {
    requiredDate?: string;
    requestedBy: string;
    reason: string;
    department?: string;
    priority: number;
    items: CreatePurchaseRequestItemDto[];
}

export const getPurchaseRequests = async () => {
    const response = await client.get<PurchaseRequestDto[]>('/purchaserequests');
    return response.data;
};

export const createPurchaseRequest = async (data: CreatePurchaseRequestDto) => {
    const response = await client.post<string>('/purchaserequests', data);
    return response.data;
};

export const approvePurchaseRequest = async (id: string, remarks?: string) => {
    const response = await client.post<boolean>(`/purchaserequests/${id}/approve`, { remarks });
    return response.data;
};

export const updatePurchaseRequest = async (id: string, data: CreatePurchaseRequestDto) => {
    const response = await client.put<string>(`/purchaserequests/${id}`, data);
    return response.data;
};
// --- Purchase Orders ---

export interface PurchaseOrderItemDto {
    id: string;
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    accountId?: string;
    taxId?: string;
}

export interface PurchaseOrderDto {
    id: string;
    orderNumber: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    vendorId: string;
    vendorName: string;

    reference: string;
    paymentTerms: string;
    shipmentPreference: string;
    deliveryAddress: string;
    notes: string;
    termsAndConditions: string;

    subTotal: number;
    taxAmount: number;
    discountPercentage: number;
    discountAmount: number;
    adjustment: number;
    totalAmount: number;

    status: string; // PurchaseOrderStatus (Draft, Sent...)
    approvalStatus: number; // 0=Pending, 1=Approved
    orderType: string; // Standard, Service...
    purchaseRequestId?: string;

    items: PurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    accountId?: string;
    taxId?: string;
}

export interface CreatePurchaseOrderDto {
    vendorId: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    deliveryAddress?: string;
    paymentTerms?: string;
    shipmentPreference?: string;
    reference?: string;
    notes?: string;
    termsAndConditions?: string;

    subTotal?: number;
    taxAmount?: number;
    discountPercentage?: number;
    discountAmount?: number;
    adjustment?: number;

    orderType?: number;

    purchaseRequestId?: string;
    items: CreatePurchaseOrderItemDto[];
}

export const getPurchaseOrders = async () => {
    const response = await client.get<PurchaseOrderDto[]>('/purchaseorders');
    return response.data;
};

// ... existing createPurchaseOrder ...
export const createPurchaseOrder = async (data: CreatePurchaseOrderDto) => {
    const response = await client.post<string>('/purchaseorders', data);
    return response.data;
};

export const updatePurchaseOrder = async (id: string, data: CreatePurchaseOrderDto) => {
    const response = await client.put<string>(`/purchaseorders/${id}`, data);
    return response.data;
};

export const approvePurchaseOrder = async (id: string) => {
    const response = await client.post<boolean>(`/purchaseorders/${id}/approve`);
    return response.data;
};

export const sendPurchaseOrder = async (id: string) => {
    const response = await client.post<boolean>(`/purchaseorders/${id}/send`);
    return response.data;
};

// --- GRNs ---

export interface GrnItemDto {
    id: string;
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
}

export interface GrnDto {
    id: string;
    grnNumber: string;
    grnDate: string;
    vendorId: string;
    vendorName: string;
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    vendorInvoiceNumber: string;
    status: string;
    items: GrnItemDto[];
}

export interface CreateGrnItemDto {
    itemId: string;
    description: string;
    quantity: number;
}

export interface CreateGrnDto {
    vendorId: string;
    purchaseOrderId?: string;
    grnDate: string;
    vendorInvoiceNumber: string;
    items: CreateGrnItemDto[];
}

export const getGrns = async () => {
    const response = await client.get<GrnDto[]>('/grns');
    return response.data;
};

export const createGrn = async (data: CreateGrnDto) => {
    const response = await client.post<string>('/grns', data);
    return response.data;
};

// --- Bills ---

export interface BillLineDto {
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

export interface BillDto {
    id: string;
    billNumber: string;
    vendorBillNumber: string;
    billDate: string;
    dueDate: string;
    vendorId: string;
    vendorName: string;
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    grnId?: string;
    grnNumber?: string;
    subTotal: number;
    taxAmount: number;
    tdsAmount: number;
    netPayable: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: string;
    matchStatus?: string;
    items: BillLineDto[];
}

export interface CreateBillLineDto {
    itemId: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
}

export interface CreateBillDto {
    vendorId: string;
    purchaseOrderId?: string;
    grnId?: string;
    vendorBillNumber: string;
    billDate: string;
    dueDate: string;
    tdsRate?: number;
    tdsCategory?: string;
    items: CreateBillLineDto[];
}

export const getBills = async () => {
    const response = await client.get<BillDto[]>('/bills');
    return response.data;
};

export const createBill = async (data: CreateBillDto) => {
    const response = await client.post<string>('/bills', data);
    return response.data;
};
// --- Debit Notes ---

export interface DebitNote {
    id: string;
    debitNoteNumber: string;
    debitNoteDate: string;
    vendorId: string;
    vendorName: string;
    billId?: string;
    billNumber?: string;
    reason?: string;
    totalAmount: number;
    status: string;
    lines: DebitNoteLine[];
}

export interface DebitNoteLine {
    id?: string;
    itemId: string;
    itemName?: string;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
    amount?: number;
}

export const getDebitNotes = async (): Promise<DebitNote[]> => {
    const response = await client.get("/debitnotes");
    return response.data;
};

export const getDebitNoteById = async (id: string): Promise<DebitNote> => {
    const response = await client.get(`/debitnotes/${id}`);
    return response.data;
};

export const createDebitNote = async (data: Partial<DebitNote>): Promise<string> => {
    const response = await client.post("/debitnotes", data);
    return response.data;
};
