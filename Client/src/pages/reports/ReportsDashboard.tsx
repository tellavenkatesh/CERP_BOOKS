import { Link } from "react-router-dom";
import {
    FileBarChart,
    CreditCard,
    Users,
    Package,
    Truck,
    Landmark,
    PieChart,
    TrendingUp,
    FileText,
    List,
    Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportsDashboard() {
    const reportCategories = [
        {
            title: "Financial Reports",
            description: "Core accounting statements",
            icon: <Landmark className="h-6 w-6 text-primary" />,
            reports: [
                { name: "General Ledger", path: "/reports/ledger", icon: <FileText className="h-4 w-4 mr-2" /> },
                { name: "Trial Balance", path: "/reports/trial-balance", icon: <CreditCard className="h-4 w-4 mr-2" /> },
                { name: "Profit & Loss", path: "/reports/profit-loss", icon: <TrendingUp className="h-4 w-4 mr-2" /> },
                { name: "Balance Sheet", path: "/reports/balance-sheet", icon: <PieChart className="h-4 w-4 mr-2" /> },
                { name: "Cash Flow", path: "/reports/cash-flow", icon: <TrendingUp className="h-4 w-4 mr-2" /> },
            ]
        },
        {
            title: "Transaction Reports",
            description: "Daily registers and vouchers",
            icon: <List className="h-6 w-6 text-indigo-600" />,
            reports: [
                { name: "Day Book", path: "/reports/day-book", icon: <FileText className="h-4 w-4 mr-2" /> },
                // Add more if needed like 'Journal Register', 'High Value Txns'
            ]
        },
        {
            title: "Party Reports",
            description: "Customer and Vendor outstanding",
            icon: <Users className="h-6 w-6 text-blue-600" />,
            reports: [
                { name: "Receivables Aging", path: "/reports/receivables-aging", icon: <Users className="h-4 w-4 mr-2" /> },
                { name: "Payables Aging", path: "/reports/payables-aging", icon: <Users className="h-4 w-4 mr-2" /> },
            ]
        },
        {
            title: "Tax Reports",
            description: "GST and TDS compliance",
            icon: <FileBarChart className="h-6 w-6 text-amber-600" />,
            reports: [
                { name: "TDS Reports", path: "/reports/tds", icon: <FileBarChart className="h-4 w-4 mr-2" /> },
                { name: "GST Reports", path: "/reports/gst", icon: <FileBarChart className="h-4 w-4 mr-2" /> },
            ]
        },
        {
            title: "Operational Reports",
            description: "Sales, Purchase, and Inventory",
            icon: <Package className="h-6 w-6 text-green-600" />,
            reports: [
                { name: "Sales Orders", path: "/reports/sales-orders", icon: <Truck className="h-4 w-4 mr-2" /> },
                { name: "Purchase Orders", path: "/reports/purchase-orders", icon: <Package className="h-4 w-4 mr-2" /> },
                { name: "GRN Register", path: "/reports/grn-register", icon: <Package className="h-4 w-4 mr-2" /> },
            ]
        },
        {
            title: "Custom Reports",
            description: "User defined and saved reports",
            icon: <Settings className="h-6 w-6 text-gray-600" />,
            reports: [
                { name: "My Saved Reports", path: "/reports/saved", icon: <FileText className="h-4 w-4 mr-2" /> },
                { name: "Report Builder", path: "/reports/builder", icon: <Settings className="h-4 w-4 mr-2" /> },
            ]
        }
    ];

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-2">Reports Dashboard</h1>
            <p className="text-muted-foreground mb-8">Central hub for all financial, operational, and tax insights.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCategories.map((category) => (
                    <Card key={category.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="bg-muted p-2 rounded-lg">
                                {category.icon}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{category.title}</CardTitle>
                                <CardDescription className="text-xs">{category.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-1">
                                {category.reports.map((report) => (
                                    <Link key={report.name} to={report.path}>
                                        <div className="flex items-center p-2 rounded-md hover:bg-muted transition-colors text-sm">
                                            {report.icon}
                                            {report.name}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
