import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Register form submitted');
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            console.log('Calling register API...');
            const response = await register({ firstName, lastName, email, password });
            console.log('Register API response:', response);

            if (response && response.success === false) {
                setError(response.message || 'Registration failed');
                return;
            }

            navigate('/login');
        } catch (err: any) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please checking backend connection.';
            setError(errorMessage);
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

            <Card className="z-10 w-full max-w-[480px] shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-3xl font-bold tracking-tight text-center text-primary">Create Account</CardTitle>
                    <p className="text-sm text-muted-foreground text-center">Join Compreo Books ERP today</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="bg-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-white"
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm font-medium border border-red-200 bg-red-50 p-2 rounded">{error}</div>}

                        <Button type="submit" className="w-full h-10 font-semibold text-md shadow-md">Sign Up</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t pt-6 pb-6 bg-gray-50/50">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
