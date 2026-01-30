import apiClient from "./client";

// --- DTOs ---

// Financial
// Financial
export interface LedgerTransaction {
    date: string;
    voucherType: string;
    voucherNumber: string;
    description: string;
    debit: number;
    credit: number;
    runningBalance: number;
}

export interface LedgerReportResponse {
    accountId: string;
    accountName: string;
    openingBalance: number;
    transactions: LedgerTransaction[];
    closingBalance: number;
}

export interface DayBookEntry {
    date: string;
    voucherNo: string;
    voucherType: string;
    account: string;
    narration: string;
    amount: number;
}

// Trial Balance
export interface TrialBalanceLine {
    accountId: string;
    accountName: string;
    accountCode: string;
    debit: number;
    credit: number;
}

export interface TrialBalanceResponse {
    asOfDate: string;
    lines: TrialBalanceLine[];
    totalDebit: number;
    totalCredit: number;
}

// Profit & Loss
export interface PnLAccount {
    accountId: string;
    accountName: string;
    amount: number;
}

export interface ProfitAndLossResponse {
    fromDate: string;
    toDate: string;
    incomeAccounts: PnLAccount[];
    expenseAccounts: PnLAccount[];
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
}

// Balance Sheet
export interface BSAccount {
    accountId: string;
    accountName: string;
    amount: number;
}

export interface BalanceSheetResponse {
    asOfDate: string;
    assets: BSAccount[];
    liabilities: BSAccount[];
    equity: BSAccount[];
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
}

// Cash Flow (Placeholder - Backend Pending)
export interface CashFlowEntry {
    category: "Operating" | "Investing" | "Financing";
    description: string;
    amount: number;
}

// Party Aging
export interface AgingBucket {
    range: string;
    amount: number;
}

export interface PartyAgingEntry {
    partyName: string;
    totalDue: number;
    buckets: AgingBucket[];
}

export interface AgingReportResponse {
    reportDate: string;
    entries: PartyAgingEntry[];
}

// Tax
export interface TDSEntry {
    section: string;
    partyName: string;
    paymentAmount: number;
    tdsRate: number;
    tdsDeducted: number;
    paymentDate: string;
}

export interface GSTEntry {
    gstin: string;
    partyName: string;
    invoiceNo: string;
    date: string;
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    totalTax: number;
}

// Operational
export interface OrderStatusEntry {
    orderNo: string;
    date: string;
    partyName: string;
    totalAmount: number;
    status: "Pending" | "Partial" | "Completed";
    deliveryDate?: string;
}

export interface GRNEntry {
    grnNo: string;
    date: string;
    vendorName: string;
    poNo: string;
    status: "Pending Bill" | "Billed";
}

// --- API Functions ---

export const getTrialBalance = async (asOf: string): Promise<TrialBalanceResponse> => {
    const response = await apiClient.get<TrialBalanceResponse>(`/reports/trial-balance`, { params: { asOfDate: asOf } });
    return response.data;
};

export const getPLStatement = async (from: string, to: string): Promise<ProfitAndLossResponse> => {
    const response = await apiClient.get<ProfitAndLossResponse>(`/reports/profit-loss`, { params: { fromDate: from, toDate: to } });
    return response.data;
};

export const getBalanceSheet = async (asOf: string): Promise<BalanceSheetResponse> => {
    const response = await apiClient.get<BalanceSheetResponse>(`/reports/balance-sheet`, { params: { asOfDate: asOf } });
    return response.data;
};

// Financial
export const getLedgerReport = async (accountId: string, from: string, to: string): Promise<LedgerReportResponse> => {
    const response = await apiClient.get<LedgerReportResponse>(`/reports/ledger/${accountId}`, { params: { fromDate: from, toDate: to } });
    return response.data;
};

export const getDayBook = async (date: string): Promise<DayBookEntry[]> => {
    const response = await apiClient.get<DayBookEntry[]>(`/reports/day-book`, { params: { date } });
    return response.data;
};

export const getAgingReport = async (type: "Receivable" | "Payable", asOf: string): Promise<PartyAgingEntry[]> => {
    // Backend returns AgingReportDto which contains Entries list
    const response = await apiClient.get<AgingReportResponse>(`/reports/aging`, { params: { type: type === "Receivable" ? 0 : 1, asOfDate: asOf } });
    return response.data.entries;
};

export interface CashFlowResponse {
    fromDate: string;
    toDate: string;
    operatingActivities: CashFlowEntry[];
    investingActivities: CashFlowEntry[];
    financingActivities: CashFlowEntry[];
    netCashFlow: number;
}

export const getCashFlowStatement = async (from: string, to: string): Promise<CashFlowResponse> => {
    const response = await apiClient.get<CashFlowResponse>(`/reports/cash-flow`, { params: { fromDate: from, toDate: to } });
    return response.data;
};

// Tax
export const getTDSReport = async (from: string, to: string): Promise<TDSEntry[]> => {
    const response = await apiClient.get<TDSEntry[]>(`/reports/tds`, { params: { fromDate: from, toDate: to } });
    return response.data;
}

export const getGSTReport = async (type: "GSTR1" | "GSTR2", from: string, to: string): Promise<GSTEntry[]> => {
    const response = await apiClient.get<GSTEntry[]>(`/reports/gst`, { params: { type, fromDate: from, toDate: to } });
    return response.data;
}

// Operational
export const getSalesOrderReport = async (): Promise<OrderStatusEntry[]> => {
    const response = await apiClient.get<OrderStatusEntry[]>(`/reports/sales-orders`);
    return response.data;
}

export const getPurchaseOrderReport = async (): Promise<OrderStatusEntry[]> => {
    const response = await apiClient.get<OrderStatusEntry[]>(`/reports/purchase-orders`);
    return response.data;
}

export const getGRNReport = async (): Promise<GRNEntry[]> => {
    const response = await apiClient.get<GRNEntry[]>(`/reports/grn`);
    return response.data;
}

// --- New Advanced Reports ---

// TDS
export interface TDSPayableEntry {
    section: string;
    totalAmountPaid: number;
    totalTdsDeducted: number;
    tdsDeposited: number;
    balancePayable: number;
}

export const getTDSPayableReport = async (from: string, to: string): Promise<TDSPayableEntry[]> => {
    const response = await apiClient.get<TDSPayableEntry[]>(`/reports/tds-payable`, { params: { fromDate: from, toDate: to } });
    return response.data;
};

export interface TDSQuarterlyReportEntry {
    quarter: string;
    formType: string;
    status: string;
    acknowledgmentNo: string;
    dateFiled: string;
}

export const getTDSQuarterlyReport = async (quarter: string) => {
    // Mocking 26Q return data structure
    return new Promise<TDSQuarterlyReportEntry[]>(resolve => setTimeout(() => resolve([
        { quarter, formType: "26Q", status: "Filed", acknowledgmentNo: "123456789", dateFiled: "2024-01-15" }
    ]), 500));
}

// GST 3B & Payable
export interface GSTSummaryEntry {
    category: "Outward Supplies" | "Inward Supplies" | "ITC" | "Payable";
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
}

export const getGST3BReport = async (month: string) => {
    return new Promise<GSTSummaryEntry[]>(resolve => setTimeout(() => resolve([
        { category: "Outward Supplies", taxableValue: 100000, igst: 18000, cgst: 0, sgst: 0 },
        { category: "Inward Supplies", taxableValue: 50000, igst: 0, cgst: 4500, sgst: 4500 },
        { category: "ITC", taxableValue: 0, igst: 9000, cgst: 4500, sgst: 4500 },
        { category: "Payable", taxableValue: 0, igst: 9000, cgst: -4500, sgst: -4500 } // Negative means credit ledger balance usage
    ]), 500));
}

// Vendor Performance
export interface VendorPerformanceEntry {
    vendorName: string;
    totalOrders: number;
    onTimeDeliveryPct: number;
    qualityRejectionPct: number;
    rating: number; // 1-5
}

export const getVendorPerformanceReport = async () => {
    return new Promise<VendorPerformanceEntry[]>(resolve => setTimeout(() => resolve([
        { vendorName: "Vendor X", totalOrders: 10, onTimeDeliveryPct: 90, qualityRejectionPct: 2, rating: 4.5 },
        { vendorName: "Vendor Y", totalOrders: 5, onTimeDeliveryPct: 60, qualityRejectionPct: 15, rating: 2.5 },
    ]), 500));
}

// Quality Rejections
export interface QualityRejectionEntry {
    grnNo: string;
    itemCode: string;
    itemName: string;
    rejectedQty: number;
    reason: string;
}

export const getQualityRejectionReport = async () => {
    return new Promise<QualityRejectionEntry[]>(resolve => setTimeout(() => resolve([
        { grnNo: "GRN-005", itemCode: "ITEM-A", itemName: "Steel Rods", rejectedQty: 50, reason: "Rusted" },
        { grnNo: "GRN-008", itemCode: "ITEM-B", itemName: "Plastic Sheet", rejectedQty: 10, reason: "Damaged in Transit" },
    ]), 500));
}

// 3-Way Matching
export interface ThreeWayMatchEntry {
    poNo: string;
    grnNo: string;
    billNo: string;
    itemCode: string;
    poQty: number;
    grnQty: number;
    billQty: number;
    status: "Matched" | "Mismatch";
    discrepancy?: string;
}

export const getThreeWayMatchReport = async () => {
    return new Promise<ThreeWayMatchEntry[]>(resolve => setTimeout(() => resolve([
        { poNo: "PO-002", grnNo: "GRN-003", billNo: "BILL-005", itemCode: "ITEM-C", poQty: 50, grnQty: 45, billQty: 50, status: "Mismatch", discrepancy: "Short Receipt" },
    ]), 500));
}

// --- Dashboard ---
export interface DashboardStats {
    totalRevenue: number;
    revenueGrowth: number;
    totalExpenses: number;
    expenseGrowth: number;
    totalReceivables: number;
    overdueReceivables: number;
    totalPayables: number;
    upcomingPayables: number;
    revenueTrend: { month: string; sales: number; expenses: number }[];
    expenseBreakdown: { name: string; value: number; color: string }[];
    recentActivity: { id: string; type: string; message: string; time: string; amount: string }[];
}

export const getDashboardStats = async (startDate?: Date, endDate?: Date): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await apiClient.get<DashboardStats>(`/reports/dashboard-stats?${params.toString()}`);
    return response.data;
};
