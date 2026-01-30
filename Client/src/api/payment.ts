import client from './client';

export interface PaymentDto {
    id: string;
    paymentNumber: string;
    paymentDate: string;
    vendorId: string;
    vendorName: string;
    billId: string;
    billNumber: string;
    amount: number;
    paymentMode: number;
    referenceNumber?: string;
    remarks?: string;
}

export interface CreatePaymentDto {
    vendorId: string;
    billId: string;
    paymentDate: string;
    amount: number;
    paymentMode: number;
    referenceNumber?: string;
    remarks?: string;
}

export const getPayments = async () => {
    const response = await client.get<PaymentDto[]>('/payments');
    return response.data;
};

export const createPayment = async (data: CreatePaymentDto) => {
    const response = await client.post<string>('/payments', data);
    return response.data;
};
