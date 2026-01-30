import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getRecurringInvoices } from '@/api/sales';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RecurringInvoicesPage() {
    const { data: profiles = [], isLoading } = useQuery({
        queryKey: ['recurring-invoices'],
        queryFn: getRecurringInvoices,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Recurring Invoices</h2>
                <Button asChild>
                    <Link to="/sales/recurring/new">
                        <Plus className="mr-2 h-4 w-4" /> New Profile
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Profile Name</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Interval</TableHead>
                                <TableHead>Next Run</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No recurring profiles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                profiles.map((profile) => (
                                    <TableRow key={profile.id}>
                                        <TableCell className="font-medium">{profile.profileName}</TableCell>
                                        <TableCell>{profile.customerName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{profile.interval}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(profile.nextRunDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'}>
                                                {profile.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>₹{profile.totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
