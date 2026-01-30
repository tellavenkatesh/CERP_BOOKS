import apiClient from "./client";

export const PaymentMode = {
    Cash: 0,
    BankTransfer: 1,
    Cheque: 2,
    UPI: 3,
    CreditCard: 4
} as const;

export type PaymentMode = typeof PaymentMode[keyof typeof PaymentMode];

// Receipts
export interface Receipt {
    id: string;
    receiptNumber: string;
    receiptDate: string;
    customerId: string;
    customerName: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    notes?: string;
}

export interface CreateReceiptRequest {
    receiptDate: string; // ISO string
    customerId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    notes?: string;
    allocations?: {
        invoiceId: string;
        amount: number;
    }[];
}

export const getReceipts = async (): Promise<Receipt[]> => {
    const response = await apiClient.get<Receipt[]>("/receipts");
    return response.data;
};

export const createReceipt = async (data: CreateReceiptRequest): Promise<string> => {
    const response = await apiClient.post<string>("/receipts", data);
    return response.data;
};

// Payments
export interface Payment {
    id: string;
    paymentNumber: string;
    paymentDate: string;
    vendorId: string;
    vendorName: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    notes?: string;
}

export interface CreatePaymentRequest {
    paymentDate: string;
    vendorId: string;
    amount: number;
    paymentMode: PaymentMode;
    referenceNumber?: string;
    notes?: string;
    tdsTaxCodeId?: string;
    tdsAmount?: number;
    allocations?: {
        billId: string;
        amount: number;
    }[];
}

export const getPayments = async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>("/payments");
    return response.data;
};

export const createPayment = async (data: CreatePaymentRequest): Promise<string> => {
    const response = await apiClient.post<string>("/payments", data);
    return response.data;
};

// Journal Entries
export interface JournalEntryLineDto {
    id?: string;
    accountId: string;
    accountName?: string;
    description?: string;
    partyId?: string; // Added Party
    partyName?: string;
    debitAmount: number;
    creditAmount: number;
}

export interface JournalEntry {
    id: string;
    journalNumber: string;
    journalDate: string;
    narration: string;
    status: string; // Added Status
    lines: JournalEntryLineDto[];
}

export interface CreateJournalEntryRequest {
    journalDate: string;
    narration: string;
    status: string; // Added Status
    lines: {
        accountId: string;
        partyId?: string; // Added Party
        description?: string;
        debitAmount: number;
        creditAmount: number;
    }[];
}

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
    const response = await apiClient.get<JournalEntry[]>("/journalentries");
    return response.data;
};

export const getJournalEntryById = async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.get<JournalEntry>(`/journalentries/${id}`);
    return response.data;
};

export const createJournalEntry = async (data: CreateJournalEntryRequest): Promise<string> => {
    const response = await apiClient.post<string>("/journalentries", data);
    return response.data;
};

export const updateJournalEntry = async (id: string, data: CreateJournalEntryRequest): Promise<void> => {
    await apiClient.put(`/journalentries/${id}`, data);
};

// Contra Entries
export interface ContraEntryLineDto {
    id?: string;
    accountId: string;
    accountName?: string;
    description?: string;
    amount: number;
    type: string; // "Debit" or "Credit"
}

export interface ContraEntry {
    id: string;
    contraNumber: string;
    contraDate: string;
    description: string;
    totalAmount: number;
    status: string;
    lines: ContraEntryLineDto[];
}

export interface CreateContraEntryRequest {
    contraDate: string;
    description: string;
    lines: {
        accountId: string;
        description?: string;
        amount: number;
        type: number; // 0 = Debit, 1 = Credit
    }[];
}

export const getContraEntries = async (): Promise<ContraEntry[]> => {
    const response = await apiClient.get<ContraEntry[]>("/contraentries");
    return response.data;
};

export const createContraEntry = async (data: CreateContraEntryRequest): Promise<string> => {
    const response = await apiClient.post<string>("/contraentries", data);
    return response.data;
};

// Bank Reconciliation
export interface UnreconciledTransactionDto {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
    originalIdType: string;
}

export interface CreateBankReconciliationRequest {
    accountId: string;
    statementDate: string;
    statementBalance: number;
    reconciledItems: {
        transactionId: string;
        originalIdType: string;
        transactionDate: string;
        amount: number;
        description: string;
    }[];
}

export const getUnreconciledTransactions = async (accountId: string): Promise<UnreconciledTransactionDto[]> => {
    const response = await apiClient.get<UnreconciledTransactionDto[]>(`/bankreconciliation/unreconciled?accountId=${accountId}`);
    return response.data;
};

export const createBankReconciliation = async (data: CreateBankReconciliationRequest): Promise<string> => {
    const response = await apiClient.post<string>("/bankreconciliation", data);
    return response.data;
};
