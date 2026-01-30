import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ChatMessage } from '@/api/ai';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function ChatAssistantPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your Compreo Finance Assistant. Ask me about your reports, cash flow, or top customers.', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');

    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Real API Call
            const { chatWithAi } = await import('@/api/ai');
            const data = await chatWithAi(userMsg.content);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to the AI service right now.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-indigo-500" />
                AI Finance Assistant
            </h1>

            <Card className="flex-1 flex flex-col overflow-hidden border-indigo-100 shadow-md">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                                        <Bot className="h-5 w-5 text-indigo-600" />
                                    </div>
                                )}

                                <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className="text-[10px] opacity-70 mt-1 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-slate-50">
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <Input
                            placeholder="Ask about your finances (e.g., 'What is my cash flow this month?')"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1"
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="max-w-3xl mx-auto mt-2 flex gap-2 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => setInput("Who are my top overdue customers?")} className="text-xs text-muted-foreground border border-dashed">
                            Top Overdue Customers
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setInput("Show P&L for Q1 2025")} className="text-xs text-muted-foreground border border-dashed">
                            P&L Q1 2025
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setInput("Analyze my expense trends")} className="text-xs text-muted-foreground border border-dashed">
                            Expense Trends
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
