import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuditLogs, type AuditLogFilter } from "@/api/admin";

export default function AuditTrailPage() {
    const [filters, setFilters] = useState<AuditLogFilter>({});

    const { data: logs, isLoading, refetch } = useQuery({
        queryKey: ['auditLogs', filters],
        queryFn: () => getAuditLogs(filters),
    });

    const handleSearch = () => {
        refetch();
    };

    return (
        <div className="container mx-auto py-10 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Input
                            type="date"
                            placeholder="Start Date"
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <Input
                            type="date"
                            placeholder="End Date"
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                        <Input
                            placeholder="User ID / Name"
                            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                        />
                        <Select onValueChange={(val) => setFilters(prev => ({ ...prev, action: val === "ALL" ? undefined : val }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Actions</SelectItem>
                                <SelectItem value="Added">Create</SelectItem>
                                <SelectItem value="Modified">Edit</SelectItem>
                                <SelectItem value="Deleted">Delete</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} className="w-full">
                            <Search className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : logs?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No audit logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs?.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                                            <TableCell>{log.userId}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.action === "Added" ? "bg-green-100 text-green-800" :
                                                        log.action === "Modified" ? "bg-blue-100 text-blue-800" :
                                                            "bg-red-100 text-red-800"
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{log.entityName}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {log.id.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{log.ipAddress}</TableCell>
                                            <TableCell className="max-w-md truncate text-xs font-mono">
                                                {log.action === "Modified" ? (
                                                    <div title={`Old: ${log.oldValues}\nNew: ${log.newValues}`}>
                                                        Mouse over for changes
                                                    </div>
                                                ) : (
                                                    <div title={log.newValues}>View Details</div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
