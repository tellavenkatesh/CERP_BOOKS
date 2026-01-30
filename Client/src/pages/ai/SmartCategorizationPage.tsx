import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSmartCategorization, type CategorizationResult } from '@/api/ai';
import { Loader2, Sparkles } from 'lucide-react';

export default function SmartCategorizationPage() {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState<CategorizationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!description || !amount) return;
        setLoading(true);
        try {
            const data = await getSmartCategorization(description, parseFloat(amount), new Date().toISOString().split('T')[0]);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Smart Categorization</h1>
            <p className="text-muted-foreground mb-6">Test the AI's ability to categorize financial transactions.</p>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Test Transaction</CardTitle>
                        <CardDescription>Enter details to get an AI suggestion.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="e.g. Uber Ride to Airport"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 450"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Analyze with AI
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="bg-slate-50 border-indigo-100">
                        <CardHeader>
                            <CardTitle className="text-indigo-700">AI Suggestion</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase tracking-widest">Suggested Account</Label>
                                <p className="text-2xl font-bold text-slate-800">{result.suggestedAccount}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase tracking-widest">Confidence</Label>
                                <div className="mt-1">
                                    <Badge variant={result.confidence > 0.8 ? 'default' : 'secondary'}>
                                        {(result.confidence * 100).toFixed(0)}%
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase tracking-widest">Reasoning</Label>
                                <p className="text-sm text-slate-600 mt-1 italic">"{result.reasoning}"</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
