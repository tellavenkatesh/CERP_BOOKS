import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Lock, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getPeriodLockStatus, updatePeriodLock, type PeriodLockStatus } from "@/api/admin";

export default function PeriodLockPage() {
    const [status, setStatus] = useState<PeriodLockStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [lockDate, setLockDate] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const data = await getPeriodLockStatus();
            setStatus(data);
            setLockDate(data.lockDate || format(new Date(), "yyyy-MM-dd"));
            setReason(data.lockReason || "");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!status) return;
        setLoading(true);
        try {
            await updatePeriodLock({
                ...status,
                lockDate: status.isLocked ? lockDate : null,
                lockReason: reason
            });
            alert("Period Lock Settings Updated");
            loadStatus();
        } finally {
            setLoading(false);
        }
    };

    if (!status) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {status.isLocked ? <Lock className="text-red-500" /> : <Unlock className="text-green-500" />}
                        Period Lock Settings
                    </CardTitle>
                    <CardDescription>
                        Prevent editing or adding transactions prior to a specific date.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="space-y-0.5">
                            <Label className="text-base">Lock Period</Label>
                            <div className="text-sm text-muted-foreground">
                                Enable to freeze data before the lock date.
                            </div>
                        </div>
                        <Switch
                            checked={status.isLocked}
                            onCheckedChange={(checked) => setStatus({ ...status, isLocked: checked })}
                        />
                    </div>

                    {status.isLocked && (
                        <>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="lockDate">Lock Date</Label>
                                <Input
                                    type="date"
                                    id="lockDate"
                                    value={lockDate}
                                    onChange={(e) => setLockDate(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">Transactions on or before this date will be read-only.</p>
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="reason">Reason / Notes</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g. Year End Closing 2023"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
