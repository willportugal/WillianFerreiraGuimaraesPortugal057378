import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/authService';

// Mock do authService
jest.mock('../../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Componente de teste para acessar o contexto
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="loading">{isLoading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user?.username || 'null'}</span>
      <button onClick={() => login({ username: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('deve iniciar com estado não autenticado', async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(null);
    mockedAuthService.isAuthenticated.mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('deve carregar usuário do localStorage se existir', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER' };
    mockedAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockedAuthService.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('testuser');
  });

  it('deve realizar login com sucesso', async () => {
    const mockTokenResponse = {
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 300,
      user: { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER' },
    };

    mockedAuthService.getCurrentUser.mockReturnValue(null);
    mockedAuthService.isAuthenticated.mockReturnValue(false);
    mockedAuthService.login.mockResolvedValue(mockTokenResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('deve realizar logout com sucesso', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER' };
    mockedAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.logout.mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('deve lançar erro quando useAuth é usado fora do Provider', () => {
    // Suprimir erro do console para este teste
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth deve ser usado dentro de um AuthProvider');

    consoleSpy.mockRestore();
  });
});
