# Compreo Books ERP

Compreo Books ERP is a comprehensive, AI-powered Enterprise Resource Planning solution designed for book publishing and distribution businesses. It streamlines operations across Sales, Purchasing, Accounting, and Inventory management with modern web technologies and intelligent automation.

## 🚀 Technology Stack

### Backend
-   **Framework**: .NET 8 WebAPI (Clean Architecture)
-   **Database**: PostgreSQL 16 (Entity Framework Core)
-   **AI Integration**: 
    -   **Groq API**: High-speed inference (Llama 3) for OCR and Chat.
    -   **Ollama**: Local embeddings and small models (Mistral).
-   **PDF Generation**: QuestPDF
-   **Background Jobs**: Hosted Services (Recurring Invoices)

### Frontend
-   **Framework**: React 18 + Vite (TypeScript)
-   **UI Library**: Shadcn UI + Tailwind CSS
-   **State Management**: TanStack Query (React Query)
-   **Forms**: React Hook Form + Zod

---

## ✨ Key Features

### 🤖 AI-Powered Capabilities
-   **Smart Invoice Entry**: Upload PDF/Image invoices; AI extracts Vendor, Items, Taxes, and Totals automatically using Groq Vision.
-   **Financial Assistant**: RAG-based Chatbot (using vector embeddings) to answer queries about your finances and navigate the application.
-   **Auto-Categorization**: Suggests the correct Ledger Account for expenses based on descriptions.
-   **Anomaly Detection**: Flags duplicate entries or unusual transactions in Journal Entries.

### 💰 Accounts & Finance
-   **General Ledger**: Comprehensive Chart of Accounts.
-   **Bank Reconciliation**: Import bank statements (CSV) and auto-match transactions with system records.
-   **Financial Reports**: Trial Balance, Profit & Loss, Balance Sheet, Cash Flow.
-   **Taxation**: GST and TDS Reports (GSTR-1, GSTR-3B).

### 🛒 Purchasing
-   **Workflow**: Purchase Request -> Purchase Order -> GRN (Goods Receipt) -> Vendor Bill -> Payment.
-   **PO Management**: Email Purchase Orders as PDFs directly to vendors. Link PRs to POs.
-   **Automation**: Auto-updates inventory upon GRN creation.

### 📈 Sales
-   **Workflow**: Estimate/Quote -> Sales Order -> Delivery Challan -> Sales Invoice -> Receipt.
-   **Public Approval**: Send "Public View Links" for Sales Orders to customers for external approval.
-   **Recurring Invoices**: Automated invoice generation for subscriptions/retainers.

---

## 🛠️ Setup & Installation

### Prerequisites
-   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
-   [Node.js 20+](https://nodejs.org/)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Git](https://git-scm.com/)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Compreo_Books_ERP
```

### 2. Backend Configuration
1.  Navigate to `Solution/WebAPI`.
2.  Update `appsettings.json`:
    -   Set `"DefaultConnection"` to your PostgreSQL connection string.
    -   Set `"AI:GroqApiKey"` (Get a free key from [console.groq.com](https://console.groq.com)).
    -   Configure `"EmailSettings"` for SMTP.
3.  Run Migrations & Seed Data:
    ```bash
    dotnet ef database update
    ```
    ![Database Update](assets/ef_update.png)

4.  Run the API:
    ```bash
    dotnet run
    ```
    ![Run API](assets/dotnet_run.png)
    *API runs on `http://localhost:5110` by default.*

### 3. Frontend Configuration
1.  Navigate to `Client`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run Development Server:
    ```bash
    npm run dev
    ```
    ![Run Frontend](assets/npm_run_dev.png)
    *App runs on `http://localhost:5173`.*

---

## ☁️ Deployment

Deployment workflows are included for both **Azure** and **AWS**.

-   **Azure**: App Service (Backend) + Static Web Apps (Frontend) + Azure SQL/PostgreSQL.
    -   [View Guide](.agent/workflows/deploy-to-azure.md)
-   **AWS**: Elastic Beanstalk (Backend) + Amplify (Frontend) + RDS.
    -   [View Guide](.agent/workflows/deploy-to-aws.md)

---

## 📂 Project Structure
-   `/Solution`: backend solution (.NET)
    -   `WebAPI`: API Controllers and Configuration
    -   `Application`: Business Logic / CQRS handlers
    -   `Domain`: Entities and Enums
    -   `Infrastructure`: Database, AI, and Email implementations
-   `/Client`: Frontend application (React)
