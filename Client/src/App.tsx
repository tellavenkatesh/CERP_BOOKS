import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardPage from '@/pages/DashboardPage';
import InvoiceTemplatesPage from '@/pages/admin/InvoiceTemplatesPage';
import CompaniesPage from '@/pages/masters/CompaniesPage';
import AccountsPage from '@/pages/masters/AccountsPage';
import CustomerPage from '@/pages/masters/CustomerPage';
import CustomerFormPage from '@/pages/masters/CustomerFormPage';
import VendorPage from '@/pages/masters/VendorPage';
import VendorFormPage from '@/pages/masters/VendorFormPage';
import ItemsPage from '@/pages/masters/ItemsPage';

// Sales Pages
import EstimatesPage from '@/pages/sales/EstimatesPage';
import SalesOrdersPage from '@/pages/sales/SalesOrdersPage';
import DeliveryChallansPage from '@/pages/sales/DeliveryChallansPage';
import SalesInvoicesPage from '@/pages/sales/SalesInvoicesPage';
import CreditNotesPage from '@/pages/sales/CreditNotesPage';
// Forms (Keep existing if needed, or comment out if placeholders replace them for now)
import SalesOrderForm from '@/pages/sales/SalesOrderForm';
import SalesOrderEmailPreview from '@/pages/sales/SalesOrderEmailPreview';
import RecurringInvoicesPage from '@/pages/sales/RecurringInvoicesPage';
import RecurringInvoiceForm from '@/pages/sales/RecurringInvoiceForm';
import InvoiceForm from '@/pages/sales/InvoiceForm';
import EstimateForm from '@/pages/sales/EstimateForm';
import DeliveryChallanForm from '@/pages/sales/DeliveryChallanForm';
import CreditNoteForm from '@/pages/sales/CreditNoteForm';

// Purchase Pages
import PurchaseRequestsPage from '@/pages/purchase/PurchaseRequestsPage';
import PurchaseOrdersPage from '@/pages/purchase/PurchaseOrdersPage';
import GrnPage from '@/pages/purchase/GrnPage';
import PurchaseBillsPage from '@/pages/purchase/PurchaseBillsPage';
import DebitNotesPage from '@/pages/purchase/DebitNotesPage';
// Forms
import PurchaseOrderForm from '@/pages/purchase/PurchaseOrderForm';
import GrnForm from '@/pages/purchase/GrnForm';
import PurchaseBillForm from '@/pages/purchase/PurchaseBillForm';
import DebitNoteForm from '@/pages/purchase/DebitNoteForm';
import PaymentsPage from '@/pages/purchase/PaymentsPage';
import PurchasePaymentForm from '@/pages/purchase/PaymentForm';

// Setup
import OpeningBalances from '@/pages/setup/OpeningBalances';
import CompanySetup from '@/pages/setup/CompanySetup';

// Financial
import ReceiptsList from '@/pages/financial/ReceiptsList';
import ReceiptForm from '@/pages/financial/ReceiptForm';
import PaymentsList from '@/pages/financial/PaymentsList';
import PaymentForm from '@/pages/financial/PaymentForm';
import JournalEntriesList from '@/pages/financial/JournalEntriesList';
import JournalEntryForm from '@/pages/financial/JournalEntryForm';
import ContraEntryList from '@/pages/financial/ContraEntryList';
import ContraEntryForm from '@/pages/financial/ContraEntryForm';
import BankReconciliationForm from '@/pages/financial/BankReconciliationForm';
import RecurringTransactionList from '@/pages/financial/RecurringTransactionList';
import RecurringTransactionForm from '@/pages/financial/RecurringTransactionForm';

// Reports
import ReportsDashboard from '@/pages/reports/ReportsDashboard';
import LedgerReport from '@/pages/reports/LedgerReport';
import TrialBalanceReport from '@/pages/reports/TrialBalanceReport';
import ProfitAndLossReport from '@/pages/reports/ProfitAndLossReport';
import BalanceSheetReport from '@/pages/reports/BalanceSheetReport';
import AgingReport from '@/pages/reports/AgingReport';
import DayBookReport from '@/pages/reports/DayBookReport';
import CashFlowStatement from '@/pages/reports/CashFlowStatement';
import TDSReports from '@/pages/reports/TDSReports';
import GSTReports from '@/pages/reports/GSTReports';
import SalesOrderReports from '@/pages/reports/SalesOrderReports';
import PurchaseOrderReports from '@/pages/reports/PurchaseOrderReports';
import GRNReports from '@/pages/reports/GRNReports';
import SavedReportsPage from '@/pages/reports/SavedReportsPage';
import ReportBuilderPage from '@/pages/reports/ReportBuilderPage';

// Admin
import TaxCodeList from '@/pages/admin/TaxCodeList';
import TaxCodeForm from '@/pages/admin/TaxCodeForm';
import TdsCategoryList from '@/pages/admin/TdsCategoryList';
import TdsCategoryForm from '@/pages/admin/TdsCategoryForm';
import CompanySettings from '@/pages/admin/CompanySettings';
import PeriodLockPage from '@/pages/admin/PeriodLockPage';
import AuditTrailPage from '@/pages/admin/AuditTrailPage';
import BackupRestorePage from '@/pages/admin/BackupRestorePage';
import DataImportExportPage from '@/pages/admin/DataImportExportPage';

import InvoiceUploadPage from '@/pages/ai/InvoiceUploadPage';
import ChatAssistantPage from '@/pages/ai/ChatAssistantPage';
import SmartCategorizationPage from '@/pages/ai/SmartCategorizationPage';
import AnomalyDetectionPage from '@/pages/ai/AnomalyDetectionPage';

import { AuthProvider } from '@/store/AuthContext';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';

import PaymentTermList from '@/pages/admin/PaymentTermList';
import PaymentTermForm from '@/pages/admin/PaymentTermForm';
import NumberingSeriesList from '@/pages/admin/NumberingSeriesList';
import NumberingSeriesForm from '@/pages/admin/NumberingSeriesForm';
import UsersPage from '@/pages/admin/UsersPage';

import RegisterPage from '@/pages/RegisterPage';

import PublicEstimateView from '@/pages/public/PublicEstimateView';
import EstimateComparisonView from '@/pages/sales/EstimateComparisonView';
import PublicSalesOrderView from '@/pages/public/PublicSalesOrderView';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/portal/estimate/:token" element={<PublicEstimateView />} />
          <Route path="/portal/salesorder/:token" element={<PublicSalesOrderView />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/setup/company" element={<div className="min-h-screen bg-gray-50 flex flex-col justify-center"><CompanySetup /></div>} />
            <Route path="/setup/opening-balances" element={<div className="min-h-screen bg-gray-50 flex flex-col justify-center"><OpeningBalances /></div>} />

            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="masters/accounts" element={<AccountsPage />} />
              <Route path="masters/customers" element={<CustomerPage />} />
              <Route path="masters/customers/new" element={<CustomerFormPage />} />
              <Route path="masters/customers/:id" element={<CustomerFormPage />} />
              <Route path="masters/vendors" element={<VendorPage />} />
              <Route path="masters/vendors/new" element={<VendorFormPage />} />
              <Route path="masters/vendors/:id" element={<VendorFormPage />} />
              <Route path="masters/items" element={<ItemsPage />} />
              <Route path="masters/items" element={<ItemsPage />} />

              {/* Sales Cycle */}
              {/* Sales Cycle */}
              {/* ... */}
              <Route path="sales/estimates" element={<EstimatesPage />} />
              <Route path="sales/estimates/new" element={<EstimateForm />} />
              <Route path="sales/estimates/:id" element={<EstimateForm />} />
              <Route path="sales/estimates/:id/compare" element={<EstimateComparisonView />} />
              <Route path="sales/orders" element={<SalesOrdersPage />} />
              <Route path="sales/orders/new" element={<SalesOrderForm />} />
              <Route path="sales/orders/:id" element={<SalesOrderForm />} />
              <Route path="sales/orders/:id/email" element={<SalesOrderEmailPreview />} />
              <Route path="sales/delivery-challans" element={<DeliveryChallansPage />} />
              <Route path="sales/delivery-challans/new" element={<DeliveryChallanForm />} />
              <Route path="sales/delivery-challans/:id" element={<DeliveryChallanForm />} />
              <Route path="sales/invoices" element={<SalesInvoicesPage />} />
              <Route path="sales/invoices/new" element={<InvoiceForm />} />
              <Route path="sales/credit-notes" element={<CreditNotesPage />} />
              <Route path="sales/credit-notes/new" element={<CreditNoteForm />} />
              <Route path="sales/credit-notes" element={<CreditNotesPage />} />
              <Route path="sales/credit-notes/new" element={<CreditNoteForm />} />
              <Route path="sales/credit-notes/:id" element={<CreditNoteForm />} />
              <Route path="sales/recurring" element={<RecurringInvoicesPage />} />
              <Route path="sales/recurring/new" element={<RecurringInvoiceForm />} />

              {/* Purchase Cycle */}
              <Route path="purchase/requests" element={<PurchaseRequestsPage />} />
              <Route path="purchase/orders" element={<PurchaseOrdersPage />} />
              <Route path="purchase/orders/new" element={<PurchaseOrderForm />} />
              <Route path="purchase/grns" element={<GrnPage />} />
              <Route path="purchase/grns/new" element={<GrnForm />} />
              <Route path="purchase/bills" element={<PurchaseBillsPage />} />
              <Route path="purchase/bills/new" element={<PurchaseBillForm />} />
              <Route path="purchase/debit-notes" element={<DebitNotesPage />} />
              <Route path="purchase/debit-notes/new" element={<DebitNoteForm />} />
              <Route path="purchase/debit-notes/:id" element={<DebitNoteForm />} />
              <Route path="purchase/payments" element={<PaymentsPage />} />
              <Route path="purchase/payments/new" element={<PurchasePaymentForm />} />

              <Route path="financial/receipts" element={<ReceiptsList />} />
              <Route path="financial/receipts/new" element={<ReceiptForm />} />
              <Route path="financial/payments" element={<PaymentsList />} />
              <Route path="financial/payments/new" element={<PaymentForm />} />
              <Route path="financial/journal" element={<JournalEntriesList />} />
              <Route path="financial/journal/new" element={<JournalEntryForm />} />
              <Route path="financial/journal/:id" element={<JournalEntryForm />} />
              <Route path="financial/contra" element={<ContraEntryList />} />
              <Route path="financial/contra/new" element={<ContraEntryForm />} />
              <Route path="financial/contra/:id" element={<ContraEntryForm />} />
              <Route path="financial/bank-reconciliation" element={<BankReconciliationForm />} />
              <Route path="financial/recurring" element={<RecurringTransactionList />} />
              <Route path="financial/recurring/new" element={<RecurringTransactionForm />} />
              <Route path="reports" element={<ReportsDashboard />} />
              <Route path="reports/ledger" element={<LedgerReport />} />
              <Route path="reports/day-book" element={<DayBookReport />} />
              <Route path="reports/trial-balance" element={<TrialBalanceReport />} />
              <Route path="reports/profit-loss" element={<ProfitAndLossReport />} />
              <Route path="reports/balance-sheet" element={<BalanceSheetReport />} />
              <Route path="reports/cash-flow" element={<CashFlowStatement />} />
              <Route path="reports/aging" element={<AgingReport />} />
              <Route path="reports/receivables-aging" element={<AgingReport />} />
              <Route path="reports/payables-aging" element={<AgingReport />} />
              <Route path="reports/tds" element={<TDSReports />} />
              <Route path="reports/gst" element={<GSTReports />} />
              <Route path="reports/sales-orders" element={<SalesOrderReports />} />
              <Route path="reports/purchase-orders" element={<PurchaseOrderReports />} />
              <Route path="reports/grn-register" element={<GRNReports />} />
              <Route path="reports/saved" element={<SavedReportsPage />} />
              <Route path="reports/builder" element={<ReportBuilderPage />} />

              <Route path="admin/tax-codes" element={<TaxCodeList />} />
              <Route path="admin/tax-codes/new" element={<TaxCodeForm />} />
              <Route path="admin/tds-categories" element={<TdsCategoryList />} />
              <Route path="admin/tds-categories/new" element={<TdsCategoryForm />} />
              <Route path="admin/payment-terms" element={<PaymentTermList />} />
              <Route path="admin/payment-terms/new" element={<PaymentTermForm />} />
              <Route path="admin/numbering-series" element={<NumberingSeriesList />} />
              <Route path="/admin/numbering-series/new" element={<NumberingSeriesForm />} />
              <Route path="/admin/invoice-templates" element={<InvoiceTemplatesPage />} />

              <Route path="admin/users" element={<UsersPage />} />
              <Route path="admin/audit-trail" element={<AuditTrailPage />} />
              <Route path="admin/audit-logs" element={<AuditTrailPage />} />
              <Route path="admin/company-settings" element={<CompanySettings />} />
              <Route path="admin/period-lock" element={<PeriodLockPage />} />
              <Route path="admin/backup-restore" element={<BackupRestorePage />} />
              <Route path="admin/import-export" element={<DataImportExportPage />} />

              {/* AI Features */}
              <Route path="ai/invoice-upload" element={<InvoiceUploadPage />} />
              <Route path="ai/chat" element={<ChatAssistantPage />} />
              <Route path="ai/smart-categorization" element={<SmartCategorizationPage />} />
              <Route path="ai/anomalies" element={<AnomalyDetectionPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
