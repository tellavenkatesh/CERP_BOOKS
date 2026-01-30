import { useState, useEffect } from "react";
import { Download, Upload, Server, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBackups, createBackup, restoreBackup, type BackupEntry } from "@/api/admin";

export default function BackupRestorePage() {
    const [backups, setBackups] = useState<BackupEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        const data = await getBackups();
        setBackups(data);
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        try {
            await createBackup();
            alert("Backup created successfully!");
            await loadBackups();
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: string) => {
        if (!confirm("WARNING: This will overwrite current data. Are you sure?")) return;
        setLoading(true);
        try {
            await restoreBackup(id);
            alert("System restored successfully!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Backup & Restore</h1>
                <Button onClick={handleCreateBackup} disabled={loading}>
                    <Server className="mr-2 h-4 w-4" />
                    {loading ? "Creating..." : "Create New Backup"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Automatic Backups</CardTitle>
                        <CardDescription>Configure automated backup schedules.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Daily backups are currently enabled at 00:00 UTC.
                        </p>
                        <Button variant="outline">Configure Schedule</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Restore from File</CardTitle>
                        <CardDescription>Upload a local backup file to restore.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button variant="outline" className="w-full">
                                <Upload className="mr-2 h-4 w-4" /> Upload Backup File
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Backup History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Filename</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {backups.map((bk) => (
                                <TableRow key={bk.id}>
                                    <TableCell className="font-medium">{bk.filename}</TableCell>
                                    <TableCell>{new Date(bk.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{bk.size}</TableCell>
                                    <TableCell>{bk.createdBy}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleRestore(bk.id)}>
                                            <RefreshCw className="h-4 w-4 mr-1" /> Restore
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
