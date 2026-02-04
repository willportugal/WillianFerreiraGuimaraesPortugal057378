import api from './api';
import { ApiResponse, LoginRequest, RegisterRequest, TokenResponse } from '../types';

/**
 * Serviço de autenticação - Facade Pattern
 */
export const authService = {
  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/login',
      credentials
    );
    const data = response.data.data;
    
    // Armazenar tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  /**
   * Registra novo usuário
   */
  async register(userData: RegisterRequest): Promise<TokenResponse> {
    const response = await api.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/register',
      userData
    );
    const data = response.data.data;
    
    // Armazenar tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  /**
   * Renova o token de acesso
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    const response = await api.post<ApiResponse<TokenResponse>>(
      '/api/v1/auth/refresh',
      { refreshToken }
    );
    const data = response.data.data;
    
    // Atualizar tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  },

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Obtém o usuário atual
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Obtém o token de acesso
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },
};
