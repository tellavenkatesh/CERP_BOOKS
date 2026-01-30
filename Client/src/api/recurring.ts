import apiClient from "./client";

export const Frequency = {
    Daily: "Daily",
    Weekly: "Weekly",
    Monthly: "Monthly",
    Quarterly: "Quarterly",
    Yearly: "Yearly"
} as const;

export type Frequency = typeof Frequency[keyof typeof Frequency];

export const TransactionType = {
    Invoice: "Invoice",
    Bill: "Bill",
    Payment: "Payment",
    Journal: "Journal"
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export interface RecurringTransaction {
    id: string;
    templateName: string;
    transactionType: TransactionType;
    frequency: Frequency;
    startDate: string;
    endDate?: string;
    nextRunDate: string;
    lastRunDate?: string;
    status: "Active" | "Paused";

    // Config details (simplified for list view, full object for details)
    amount?: number;
    partyName?: string;
}

export interface CreateRecurringTransactionRequest {
    templateName: string;
    transactionType: TransactionType;
    frequency: Frequency;
    startDate: string;
    endDate?: string;

    // Dynamic payload based on type
    transactionData: any;
}

// Mock Data for demonstration if backend undefined
const MOCK_DATA: RecurringTransaction[] = [
    {
        id: "1",
        templateName: "Monthly Rent",
        transactionType: "Payment",
        frequency: "Monthly",
        startDate: "2024-01-01",
        nextRunDate: "2024-06-01",
        lastRunDate: "2024-05-01",
        status: "Active",
        amount: 25000,
        partyName: "Landlord Inc"
    },
    {
        id: "2",
        templateName: "AMC Formatting",
        transactionType: "Invoice",
        frequency: "Quarterly",
        startDate: "2024-01-15",
        nextRunDate: "2024-07-15",
        lastRunDate: "2024-04-15",
        status: "Active",
        amount: 15000,
        partyName: "Tech Corp"
    }
];

export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
    // For now, return mock data to ensure UI works immediately
    // return apiClient.get<RecurringTransaction[]>("/recurring").then(res => res.data);
    return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA), 500));
};

export const createRecurringTransaction = async (data: CreateRecurringTransactionRequest): Promise<string> => {
    // return apiClient.post<string>("/recurring", data).then(res => res.data);
    return new Promise(resolve => setTimeout(() => resolve("new-id"), 500));
};

export const toggleRecurringStatus = async (id: string, status: "Active" | "Paused"): Promise<void> => {
    // apiClient.put(`/recurring/${id}/status`, { status });
    return new Promise(resolve => setTimeout(resolve, 300));
};
