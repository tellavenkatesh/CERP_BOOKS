import client from './client';

// DTOs matching Backend
export interface InvoiceExtractionResult {
    originalFileName?: string; // Client-side tracking
    vendorName: string;
    invoiceNumber: string;
    invoiceDate?: string;
    totalAmount: number;
    taxAmount: number;
    lineItems: ExtractedLineItem[];
    confidenceScore: number;
    rawText: string;
    uploadDate?: string; // Client-side
    id?: string; // Client-side
    status?: 'Processing' | 'Review' | 'Completed'; // Client-side
    suggestedAccount?: string;
}

export interface ExtractedLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatResponse {
    reply: string;
    sources: string[];
}

export interface CategorizationResult {
    suggestedAccount: string;
    confidence: number;
    reasoning: string;
    // Helper fields for UI
    id?: string;
    date?: string;
    description?: string;
    amount?: number;
}

export interface AnomalyResult {
    anomalies: AnomalyItem[];
}

export interface AnomalyItem {
    type: string;
    description: string;
    severity: string;
    transactionId: string;
    // Helper
    date?: string;
    id?: string;
}

// API Functions

export const extractInvoiceData = async (file: File): Promise<InvoiceExtractionResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post<InvoiceExtractionResult>('/ai/extract-invoice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const chatWithAi = async (message: string): Promise<ChatResponse> => {
    const response = await client.post<ChatResponse>('/ai/chat', { message });
    return response.data;
};

export const getSmartCategorization = async (description: string, amount: number, date: string): Promise<CategorizationResult> => {
    const response = await client.get<CategorizationResult>('/ai/categorize', {
        params: { description, amount, date }
    });
    return response.data;
};

export const detectAnomalies = async (transactionData: any): Promise<AnomalyResult> => {
    const response = await client.post<AnomalyResult>('/ai/detect-anomalies', transactionData);
    return response.data;
};

// --- MOCKS (Retained only if needed for fast UI testing, but commented out or unused) ---
// We remove them to enforce real usage.
