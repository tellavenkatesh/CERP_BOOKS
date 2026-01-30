
import { Link, Outlet } from 'react-router-dom';
import { ChatInterface } from './ChatInterface';
import { Toaster } from '@/components/ui/sonner';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Package2, Users, Receipt, Package, LayoutDashboard,
    ShoppingCart, FileText, Truck, Percent, CreditCard, Warehouse,
    CircleUser, Landmark, ArrowLeftRight, RefreshCw,
    FileBarChart, TrendingUp, PieChart, Lock,
    Upload, Bot, Sparkles, AlertTriangle, Settings, ChevronRight, ChevronDown, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const NavGroup = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => {
    return (
        <div className="mb-2">
            <HoverCard openDelay={0} closeDelay={100}>
                <HoverCardTrigger asChild>
                    <button
                        className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-900/20 data-[state=open]:bg-white/10 data-[state=open]:text-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="group-hover:scale-110 transition-transform duration-300">
                                {icon}
                            </div>
                            <span className="text-sm font-medium">{title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-purple-300/50" />
                    </button>
                </HoverCardTrigger>
                <HoverCardContent
                    side="right"
                    align="start"
                    className="w-64 border border-purple-500/30 bg-[#2e1065] text-purple-100 shadow-2xl backdrop-blur-xl p-2 ml-2"
                >
                    <div className="px-3 py-2 text-xs font-semibold text-purple-200 uppercase tracking-wider border-b border-purple-500/30 mb-2">
                        {title}
                    </div>
                    <div className="space-y-1">
                        {children}
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    );
};

const Clock = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-right hidden md:block">
            <div className="text-xs font-medium">{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
        </div>
    );
};

export default function Layout() {
    const { user, logout } = useAuth();
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-gradient-to-b from-[#6D28D9] to-[#4C1D95] md:block text-white">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
                        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
                            <Package2 className="h-6 w-6 text-white" />
                            <span className="">Compreo Books</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-2">
                            {/* Dashboard */}
                            {/* Dashboard */}
                            <Link
                                to="/"
                                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-1 hover:shadow-lg"
                            >
                                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                                Dashboard
                            </Link>

                            {/* Masters */}
                            <NavGroup title="Masters & Setup" icon={<Settings className="h-4 w-4" />}>
                                <Link to="/masters/accounts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Receipt className="h-4 w-4" /> Chart of Accounts
                                </Link>
                                <Link to="/masters/customers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Users className="h-4 w-4" /> Customer Master
                                </Link>
                                <Link to="/masters/vendors" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Users className="h-4 w-4" /> Vendor Master
                                </Link>
                                <Link to="/masters/items" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Package className="h-4 w-4" /> Item Master
                                </Link>
                                <Link to="/admin/tax-codes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Percent className="h-4 w-4" /> Tax Codes
                                </Link>
                                <Link to="/admin/tds-categories" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Percent className="h-4 w-4" /> TDS Categories
                                </Link>
                                <Link to="/admin/payment-terms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <CreditCard className="h-4 w-4" /> Payment Terms
                                </Link>
                                <Link to="/admin/numbering-series" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Numbering Series
                                </Link>
                                <Link to="/admin/invoice-templates" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Invoice Templates
                                </Link>
                            </NavGroup>

                            {/* Sales Cycle */}
                            <NavGroup title="Sales" icon={<ShoppingCart className="h-4 w-4" />}>
                                <Link to="/sales/estimates" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Estimates / Quotations
                                </Link>
                                <Link to="/sales/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <ShoppingCart className="h-4 w-4" /> Sales Orders
                                </Link>
                                <Link to="/sales/delivery-challans" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Truck className="h-4 w-4" /> Delivery Challans
                                </Link>
                                <Link to="/sales/invoices" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Receipt className="h-4 w-4" /> Sales Invoices
                                </Link>
                                <Link to="/sales/credit-notes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Credit Notes
                                </Link>
                            </NavGroup>

                            {/* Purchase Cycle */}
                            <NavGroup title="Purchases" icon={<Warehouse className="h-4 w-4" />}>
                                <Link to="/purchase/requests" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Purchase Requests
                                </Link>
                                <Link to="/purchase/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <ShoppingCart className="h-4 w-4" /> Purchase Orders
                                </Link>
                                <Link to="/purchase/grns" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Warehouse className="h-4 w-4" /> GRN
                                </Link>
                                <Link to="/purchase/bills" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Receipt className="h-4 w-4" /> Purchase Bills
                                </Link>
                                <Link to="/purchase/debit-notes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Debit Notes
                                </Link>
                            </NavGroup>

                            {/* Cash & Banking */}
                            <NavGroup title="Banking" icon={<Landmark className="h-4 w-4" />}>
                                <Link to="/financial/receipts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Receipt className="h-4 w-4" /> Receipts
                                </Link>
                                <Link to="/financial/payments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <CreditCard className="h-4 w-4" /> Payments
                                </Link>
                                <Link to="/financial/contra" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <ArrowLeftRight className="h-4 w-4" /> Contra Entries
                                </Link>
                                <Link to="/financial/bank-reconciliation" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Landmark className="h-4 w-4" /> Bank Reconciliation
                                </Link>
                            </NavGroup>

                            {/* Journal & Adjustments */}
                            <NavGroup title="Accounting" icon={<FileText className="h-4 w-4" />}>
                                <Link to="/financial/journal" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Journal Entries
                                </Link>
                                <Link to="/financial/recurring" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <RefreshCw className="h-4 w-4" /> Recurring Templates
                                </Link>
                            </NavGroup>

                            {/* Reports */}
                            <NavGroup title="Reports" icon={<FileBarChart className="h-4 w-4" />}>
                                <Link to="/reports" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileBarChart className="h-4 w-4" /> Reports Dashboard
                                </Link>
                                <Link to="/reports/day-book" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Day Book
                                </Link>
                                <Link to="/reports/ledger" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> General Ledger
                                </Link>
                                <Link to="/reports/trial-balance" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <CreditCard className="h-4 w-4" /> Trial Balance
                                </Link>
                                <Link to="/reports/profit-loss" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <TrendingUp className="h-4 w-4" /> Profit & Loss
                                </Link>
                                <Link to="/reports/balance-sheet" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <PieChart className="h-4 w-4" /> Balance Sheet
                                </Link>
                                <Link to="/reports/cash-flow" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <TrendingUp className="h-4 w-4" /> Cash Flow Stmt
                                </Link>
                                <Link to="/reports/receivables-aging" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Users className="h-4 w-4" /> Receivables Aging
                                </Link>
                                <Link to="/reports/payables-aging" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Users className="h-4 w-4" /> Payables Aging
                                </Link>
                                <Link to="/reports/tds" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileBarChart className="h-4 w-4" /> TDS Reports
                                </Link>
                                <Link to="/reports/gst" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileBarChart className="h-4 w-4" /> GST Reports
                                </Link>
                                <Link to="/reports/sales-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Truck className="h-4 w-4" /> Sales Order Reports
                                </Link>
                                <Link to="/reports/purchase-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <ShoppingCart className="h-4 w-4" /> Purchase Order Reports
                                </Link>
                                <Link to="/reports/grn-register" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Warehouse className="h-4 w-4" /> GRN Reports
                                </Link>
                            </NavGroup>

                            {/* Administration */}
                            <NavGroup title="Admin" icon={<Lock className="h-4 w-4" />}>
                                <Link to="/admin/company-settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Landmark className="h-4 w-4" /> Company Settings
                                </Link>
                                <Link to="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Users className="h-4 w-4" /> User Management
                                </Link>
                                <Link to="/admin/period-lock" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Lock className="h-4 w-4" /> Period Lock
                                </Link>
                                <Link to="/admin/audit-trail" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <FileText className="h-4 w-4" /> Audit Trail
                                </Link>
                                <Link to="/admin/backup-restore" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <RefreshCw className="h-4 w-4" /> Backup & Restore
                                </Link>
                                <Link to="/admin/import-export" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <ArrowLeftRight className="h-4 w-4" /> Import / Export
                                </Link>
                            </NavGroup>

                            {/* AI Features */}
                            <NavGroup title="AI Features" icon={<Sparkles className="h-4 w-4" />}>
                                <Link to="/ai/invoice-upload" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm text-sm">
                                    <Upload className="h-4 w-4" /> Invoice OCR
                                </Link>
                                <Link to="/ai/chat" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm ml-4 text-sm">
                                    <Bot className="h-4 w-4" /> AI Assistant
                                </Link>
                                <Link to="/ai/smart-categorization" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm ml-4 text-sm">
                                    <Sparkles className="h-4 w-4" /> Smart Categorization
                                </Link>
                                <Link to="/ai/anomalies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all hover:text-white hover:bg-white/10 ml-4 text-sm">
                                    <AlertTriangle className="h-4 w-4" /> Anomaly Detection
                                </Link>
                                <Link
                                    to="/sales/recurring"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-100 transition-all duration-300 hover:text-white hover:bg-white/10 hover:translate-x-2 hover:shadow-sm ml-4 text-sm"
                                >
                                    <RefreshCw className="h-4 w-4" /> Recurring Invoices
                                </Link>
                            </NavGroup>
                        </nav>
                    </div>
                    {/* Logout Button at Bottom */}
                    <div className="p-4 border-t border-white/10 mt-auto">
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-purple-100 transition-all hover:bg-red-500/20 hover:text-red-200 group"
                        >
                            <LogOut className="h-4 w-4 transition-transform group-hover:rotate-180" />
                            <span className="text-sm font-medium">Log Out</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6">
                    <div className="w-full flex-1">
                        {/* Search or other content could go here */}
                    </div>
                    <div className="flex items-center gap-4">
                        <Clock />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent focus-visible:ring-0">
                                    <Avatar className="h-9 w-9 border border-indigo-200 shadow-sm transition-all hover:scale-110 hover:shadow-md cursor-pointer ring-2 ring-white">
                                        {/* Mock Avatar Image - In real app, bind to user.avatarUrl */}
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs uppercase">
                                            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex flex-col items-start">
                                    <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-xs text-muted-foreground">{user?.role}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <Outlet />
                </main>

                <Toaster />
            </div>

        </div>
    );
}
