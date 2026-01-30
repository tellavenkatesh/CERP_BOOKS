import axios from 'axios';

const API_URL = 'http://localhost:5110/api/auditlogs';

export interface AuditLog {
    id: string;
    entityName: string;
    action: string;
    userId: string;
    timestamp: string;
    oldValues: string;
    newValues: string;
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
