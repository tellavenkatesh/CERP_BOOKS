import axios from 'axios';

const API_URL = '/api/users';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    createdAt: string;
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
    phone: string;
    permissions: string[];
}

export interface UpdateUserRequest {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    permissions: string[];
}

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getUsers = async (): Promise<User[]> => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

export const createUser = async (userData: CreateUserRequest) => {
    const response = await axios.post(API_URL, userData, getAuthHeaders());
    return response.data;
};

export const updateUser = async (userData: UpdateUserRequest) => {
    await axios.put(`${API_URL}/${userData.userId}`, userData, getAuthHeaders());
};

export const resetPassword = async (userId: string, newPassword: string) => {
    await axios.put(`${API_URL}/${userId}/reset-password`, { userId, newPassword }, getAuthHeaders());
};

export const updateUserRole = async (userId: string, newRole: string) => {
    await axios.put(`${API_URL}/${userId}/role`, JSON.stringify(newRole), {
        ...getAuthHeaders(),
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await axios.put(`${API_URL}/${userId}/status`, JSON.stringify(isActive), {
        ...getAuthHeaders(),
        headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'application/json'
        }
    });
};
