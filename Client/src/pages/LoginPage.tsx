import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { login as loginApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginApi({ email, password });
            // API returns { token, firstName, lastName, role, ... }
            // AuthContext expects (token, user, rememberMe)
            login(data.token, {
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role
            }, rememberMe);

            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="relative flex items-end justify-end min-h-screen w-full p-8 md:p-16 lg:p-24 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-black/60 bg-cover bg-center bg-no-repeat bg-blend-overlay transition-all duration-1000"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')",
                }}
            />

            <Card className="z-10 w-full max-w-[420px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-3xl font-bold tracking-tight text-center text-primary">Compreo Books</CardTitle>
                    <p className="text-sm text-muted-foreground text-center">Enter your credentials to continue</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            />
                            <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Remember me
                            </Label>
                        </div>
                        {error && <div className="text-red-500 text-sm font-medium border border-red-200 bg-red-50 p-2 rounded">{error}</div>}
                        <Button type="submit" className="w-full h-10 font-semibold text-md shadow-md">Sign In</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-6 pb-6 bg-gray-50/50">
                    <p className="text-sm text-gray-500">
                        Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
