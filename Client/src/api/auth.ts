import axios from 'axios';

const API_URL = 'http://localhost:5110/api/auth';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    firstName: string;
    lastName: string;
    role: string;
    hasCompany: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
};
