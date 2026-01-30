import { useState, useMemo } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    TrendingDown,
    FileText,
    Calendar as CalendarIcon,
    CreditCard,
    Plus,
    Users,
    Package,
    ShoppingCart,
    MoreHorizontal,
    Clock,
    CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSalesOrders, getEstimates, getDeliveryChallans } from '@/api/sales';
import { getDashboardStats } from '@/api/reports';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatInterface } from '@/components/ChatInterface';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
    const navigate = useNavigate();
    // Date Filtering State
    const [dateLabel, setDateLabel] = useState("This Month");
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

    // Helper to set range
    const setDateRangeWrapper = (label: string) => {
        setDateLabel(label);
        const now = new Date();
        let start, end;

        if (label === "This Month") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (label === "Last Month") {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (label === "This Quarter") {
            const quarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), quarter * 3, 1);
            end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        } else if (label === "This Year") {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        }

        setDateRange({ start, end });
    };

    // Real Data Fetching
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats', dateRange],
        queryFn: () => getDashboardStats(dateRange.start, dateRange.end)
    });

    // Fallback to empty if loading
    const trendData = stats?.revenueTrend || [];
    const expenseCategoryData = stats?.expenseBreakdown || [];
    const recentActivity = stats?.recentActivity || [];

    // Fetch Pending Approvals
    const { data: orders = [] } = useQuery({ queryKey: ['salesorders'], queryFn: getSalesOrders });
    const { data: estimates = [] } = useQuery({ queryKey: ['estimates'], queryFn: getEstimates });
    const { data: challans = [] } = useQuery({ queryKey: ['deliverychallans'], queryFn: getDeliveryChallans });

    const pendingOrders = orders.filter(o => o.status === 'Draft');
    const pendingEstimates = estimates.filter(e => e.status === 'Draft');
    const pendingChallans = challans.filter(d => d.status === 'Draft');

    // Greeting Time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{greeting}</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Here's what's happening with your business today.</p>
                </div>
                <div className="flex gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 border-dashed">
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" /> {dateLabel}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setDateRangeWrapper("This Month")}>This Month</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRangeWrapper("Last Month")}>Last Month</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRangeWrapper("This Quarter")}>This Quarter</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRangeWrapper("This Year")}>This Year</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20" onClick={() => navigate('/sales/invoices/new')}>
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* REVENUE CARD */}
                <Card className="hover:translate-y-[-2px] transition-all duration-300 border-none shadow-md bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">
                            TOTAL REVENUE
                        </CardTitle>
                        <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.totalRevenue) : "..."}
                        </div>
                        <div className="flex items-center text-xs text-emerald-100">
                            {(stats?.revenueGrowth || 0) >= 0 ? (
                                <span className="text-white font-bold flex items-center bg-white/20 px-1.5 py-0.5 rounded mr-2">
                                    <TrendingUp className="h-3 w-3 mr-1" /> {(stats?.revenueGrowth || 0).toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-white font-bold flex items-center bg-white/20 px-1.5 py-0.5 rounded mr-2">
                                    <TrendingDown className="h-3 w-3 mr-1" /> {(stats?.revenueGrowth || 0).toFixed(1)}%
                                </span>
                            )}
                            from last month
                        </div>
                    </CardContent>
                </Card>

                {/* EXPENSES CARD */}
                <Card className="hover:translate-y-[-2px] transition-all duration-300 border-none shadow-md bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rose-100">
                            TOTAL EXPENSES
                        </CardTitle>
                        <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <CreditCard className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-1">
                            {stats ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.totalExpenses) : "..."}
                        </div>
                        <div className="flex items-center text-xs text-rose-100">
                            {(stats?.expenseGrowth || 0) >= 0 ? (
                                <span className="text-white font-bold flex items-center bg-white/20 px-1.5 py-0.5 rounded mr-2">
                                    <TrendingUp className="h-3 w-3 mr-1" /> {(stats?.expenseGrowth || 0).toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-white font-bold flex items-center bg-white/20 px-1.5 py-0.5 rounded mr-2">
                                    <TrendingDown className="h-3 w-3 mr-1" /> {(stats?.expenseGrowth || 0).toFixed(1)}%
                                </span>
                            )}
                            from last month
                        </div>
                    </CardContent>
                </Card>

                {/* RECEIVABLES CARD */}
                <Card className="hover:shadow-xl transition-all duration-300 border-none shadow-md bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowDownLeft className="h-24 w-24 text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-100 font-medium uppercase text-xs tracking-wider">Receivables (AR)</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            {stats ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.totalReceivables) : "..."}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-blue-100 text-sm flex items-center bg-white/10 px-2 py-1 rounded w-fit backdrop-blur-sm">
                            <Clock className="h-3 w-3 mr-1.5" />
                            {stats ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.overdueReceivables) : "..."} Overdue
                        </div>
                    </CardContent>
                </Card>

                {/* PAYABLES CARD */}
                <Card className="hover:shadow-xl transition-all duration-300 border-none shadow-md bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowUpRight className="h-24 w-24 text-white" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-100 font-medium uppercase text-xs tracking-wider">Payables (AP)</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            {stats ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.totalPayables) : "..."}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-orange-100 text-sm flex items-center bg-white/10 px-2 py-1 rounded w-fit backdrop-blur-sm">
                            <Clock className="h-3 w-3 mr-1.5" />
                            {stats ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(stats.upcomingPayables) : "..."} Next 7 Days
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* LEFT COLUMN (4/7) */}
                <div className="col-span-7 lg:col-span-5 space-y-6">
                    {/* FINANCIAL TREND CHART */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Financial Performance</CardTitle>
                                    <CardDescription>Income vs Expense Trends</CardDescription>
                                </div>
                                {/* Legend */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-muted-foreground">Income</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                        <span className="text-muted-foreground">Expense</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                        <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PENDING ACTIONS */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Pending Approvals</CardTitle>
                            <CardDescription>Items needing your attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="orders" className="w-full">
                                <TabsList className="w-full justify-start bg-slate-100/50 p-1 mb-4">
                                    <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Orders ({pendingOrders.length})</TabsTrigger>
                                    <TabsTrigger value="estimates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Estimates ({pendingEstimates.length})</TabsTrigger>
                                    <TabsTrigger value="challans" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Challans ({pendingChallans.length})</TabsTrigger>
                                </TabsList>
                                <TabsContent value="orders">
                                    {pendingOrders.length === 0 ? <EmptyState message="No pending orders" /> : <PendingList items={pendingOrders} type="orders" navigate={navigate} />}
                                </TabsContent>
                                <TabsContent value="estimates">
                                    {pendingEstimates.length === 0 ? <EmptyState message="No pending estimates" /> : <PendingList items={pendingEstimates} type="estimates" navigate={navigate} />}
                                </TabsContent>
                                <TabsContent value="challans">
                                    {pendingChallans.length === 0 ? <EmptyState message="No pending challans" /> : <PendingList items={pendingChallans} type="challans" navigate={navigate} />}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN (3/7) */}
                <div className="col-span-7 lg:col-span-2 space-y-6">
                    {/* QUICK ACTIONS */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-white">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-800">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-all shadow-sm" onClick={() => navigate('/masters/customers/new')}>
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold">Add Customer</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all shadow-sm" onClick={() => navigate('/masters/items/new')}>
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                                    <Package className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold">Add Product</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:border-orange-200 hover:bg-orange-50 text-slate-600 hover:text-orange-700 transition-all shadow-sm" onClick={() => navigate('/purchase/bills/new')}>
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold">Record Bill</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-3 flex flex-col gap-2 hover:border-violet-200 hover:bg-violet-50 text-slate-600 hover:text-violet-700 transition-all shadow-sm" onClick={() => navigate('/sales/orders/new')}>
                                <div className="p-2 bg-violet-100 text-violet-600 rounded-full">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-semibold">New Order</span>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* EXPENSE BREAKDOWN */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Expense Split</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseCategoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {expenseCategoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="text-xl font-bold block text-slate-700">
                                            {stats ? new Intl.NumberFormat("en-IN", { notation: "compact", compactDisplay: "short", style: "currency", currency: "INR" }).format(stats.totalExpenses) : "..."}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                {expenseCategoryData.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-slate-600">{item.name}</span>
                                        </div>
                                        <span className="font-medium">
                                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(item.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* RECENT ACTIVITY */}
                    <Card className="border-none shadow-md flex-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6 border-l space-y-6">
                                {recentActivity.map((activity, i) => (
                                    <div key={activity.id} className="relative">
                                        <div className={cn(
                                            "absolute -left-[29px] w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white",
                                            activity.type === 'invoice' ? 'border-emerald-500' :
                                                activity.type === 'payment' ? 'border-blue-500' : 'border-slate-300'
                                        )}>
                                            <div className={cn("w-2 h-2 rounded-full",
                                                activity.type === 'invoice' ? 'bg-emerald-500' :
                                                    activity.type === 'payment' ? 'bg-blue-500' : 'bg-slate-300'
                                            )}></div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">{format(new Date(activity.time), 'MMM dd, h:mm a')}</span>
                                                <span className="text-xs font-bold text-slate-700">{activity.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ChatInterface />
        </div>
    );
}

// Sub-components for cleaner code
function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-slate-50/50 rounded-lg border-2 border-dashed">
            <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
            <p>{message}</p>
        </div>
    );
}

function PendingList({ items, type, navigate }: { items: any[], type: string, navigate: any }) {
    return (
        <div className="space-y-1">
            {items.slice(0, 5).map(item => (
                <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group border flex-wrap"
                    onClick={() => navigate(type === 'orders' ? '/sales/orders' : type === 'estimates' ? '/sales/estimates' : '/sales/delivery-challans')}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {type === 'orders' ? 'SO' : type === 'estimates' ? 'EST' : 'DC'}
                        </div>
                        <div>
                            <p className="font-medium text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                {item.orderNumber || item.estimateNumber || item.challanNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.customerName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {item.totalAmount !== undefined && (
                            <p className="font-bold text-sm">
                                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.totalAmount)}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">{format(new Date(item.orderDate || item.estimateDate || item.challanDate), 'MMM dd')}</p>
                    </div>
                </div>
            ))}
            {items.length > 5 && (
                <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">View All {items.length} Pending</Button>
            )}
        </div>
    );
}
