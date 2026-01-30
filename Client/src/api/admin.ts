
export interface BackupEntry {
    id: string;
    filename: string;
    createdAt: string;
    size: string;
    createdBy: string;
}

export interface PeriodLockStatus {
    lockDate: string | null;
    isLocked: boolean;
    lockedBy?: string;
    lockReason?: string;
}

export const getBackups = async (): Promise<BackupEntry[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
        { id: "1", filename: "backup_2024-01-01.zip", createdAt: "2024-01-01T10:00:00Z", size: "15MB", createdBy: "Admin" },
        { id: "2", filename: "backup_2024-01-08.zip", createdAt: "2024-01-08T10:00:00Z", size: "16MB", createdBy: "System" },
    ]), 500));
};

export const createBackup = async (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 2000));
};

export const restoreBackup = async (id: string): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 3000));
};



export const importData = async (type: string, file: File): Promise<{ success: boolean, message: string }> => {
    return new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: `Successfully imported ${type} from ${file.name}`
    }), 2000));
};

export const exportData = async (type: string): Promise<void> => {
    return new Promise(resolve => setTimeout(() => {
        alert(`Exporting ${type}... (Mock Download)`);
        resolve();
    }, 1000));
};

export interface CompanySettings {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    panNumber: string;
    currency: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
    booksOpeningDate: string;
    industry: string;
    companyType: string;
    enableGST: boolean;
    enableTDS: boolean;
    periodLockDate?: string | null;
    periodLockReason?: string;
}

export interface AuditLog {
    id: string;
    entityName: string;
    action: string;
    userId: string;
    ipAddress: string;
    timestamp: string;
    oldValues: string;
    newValues: string;
}

export interface AuditLogFilter {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    entityName?: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const getAuditLogs = async (filter?: AuditLogFilter): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.userId) params.append('userId', filter.userId);
    if (filter?.action) params.append('action', filter.action);
    if (filter?.entityName) params.append('entityName', filter.entityName);

    const response = await fetch(`/api/auditlogs?${params.toString()}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
};

export const getCompanySettings = async (): Promise<CompanySettings> => {
    const response = await fetch('/api/companies/settings', {
        headers: getAuthHeaders()
    });

    if (response.status === 204) {
        return {
            name: "", address: "", city: "", state: "", country: "", pincode: "",
            phone: "", email: "", website: "", taxId: "", panNumber: "",
            currency: "INR", industry: "", companyType: "",
            fiscalYearStart: `${new Date().getFullYear()}-04-01`,
            fiscalYearEnd: `${new Date().getFullYear() + 1}-03-31`,
            booksOpeningDate: new Date().toISOString().split('T')[0],
            enableGST: false, enableTDS: false,
            periodLockDate: null, periodLockReason: ""
        };
    }

    if (!response.ok) {
        throw new Error('Failed to fetch company settings');
    }
    return response.json();
};

export const updateCompanySettings = async (settings: CompanySettings): Promise<void> => {
    const response = await fetch('/api/companies/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
    });
    if (!response.ok) {
        throw new Error('Failed to update company settings');
    }
};

export const getPeriodLockStatus = async (): Promise<PeriodLockStatus> => {
    const settings = await getCompanySettings();
    return {
        lockDate: settings.periodLockDate ? settings.periodLockDate.split('T')[0] : null,
        isLocked: !!settings.periodLockDate,
        lockReason: settings.periodLockReason || ""
    };
};

export const updatePeriodLock = async (status: PeriodLockStatus): Promise<void> => {
    const payload = {
        lockDate: status.isLocked ? status.lockDate : null,
        reason: status.lockReason
    };

    const response = await fetch('/api/companies/period-lock', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Failed to update period lock');
    }
};
