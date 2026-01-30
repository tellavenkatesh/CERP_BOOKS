import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation } from '@tanstack/react-query';
import client from '@/api/client';
import { MessageCircle, Minus, Send, Bot } from 'lucide-react';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function ChatInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const mutation = useMutation({
        mutationFn: async (message: string) => {
            const { data } = await client.post('/ai/chat', { message });
            return data.reply;
        },
        onSuccess: (data) => {
            setMessages((prev) => [...prev, { role: 'assistant', content: data }]);
        }
    });

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        mutation.mutate(userMsg);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-110"
            >
                <MessageCircle className="h-8 w-8 text-white" />
            </Button>
        );
    }

    return (
        <Card className="w-[380px] h-[500px] flex flex-col fixed bottom-6 right-6 shadow-2xl z-50 animate-in slide-in-from-bottom-10 fade-in border-indigo-100">
            <CardHeader className="py-3 bg-indigo-600 text-white rounded-t-lg flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-base font-medium">Compreo AI</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-indigo-100 hover:text-white hover:bg-indigo-500"
                        onClick={() => setIsOpen(false)}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50">
                <ScrollArea className="h-full p-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 space-y-2 opacity-70">
                            <Bot className="h-12 w-12 text-indigo-300" />
                            <p className="text-sm">Hi! I'm your AI assistant. Ask me about your sales, inventory, or reports.</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`rounded-2xl px-4 py-2 max-w-[85%] text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-800 border rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {mutation.isPending && (
                            <div className="flex justify-start">
                                <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-2 text-sm text-slate-500 italic shadow-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-white">
                <div className="flex w-full gap-2">
                    <Input
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="focus-visible:ring-indigo-500"
                    />
                    <Button onClick={handleSend} disabled={mutation.isPending} size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
