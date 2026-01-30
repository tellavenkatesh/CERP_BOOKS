import { useQuery } from '@tanstack/react-query';
import { getPayments } from '@/api/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function PaymentsPage() {
    const navigate = useNavigate();
    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments'],
        queryFn: getPayments,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
                {/* <Button onClick={() => navigate('/purchase/payments/new')}>
                    <Plus className="mr-2 h-4 w-4" /> New Payment
                </Button> */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment No</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Bill No</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Ref No</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                                    <TableCell>{format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{payment.vendorName}</TableCell>
                                    <TableCell>{payment.billNumber}</TableCell>
                                    <TableCell>{payment.paymentMode}</TableCell>
                                    <TableCell>{payment.referenceNumber || '-'}</TableCell>
                                    <TableCell className="text-right">{payment.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
