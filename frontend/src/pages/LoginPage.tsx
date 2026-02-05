import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Music2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const loginSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Credenciais inválidas';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-spotify-light-gray to-spotify-black">
      {/* Header */}
      <header className="p-8">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <Music2 className="w-10 h-10 text-white" />
          <span className="text-2xl font-bold text-white">Soundify</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-spotify-dark-gray rounded-lg p-8 shadow-xl">
            <h1 className="text-3xl font-bold text-white text-center mb-8">
              Entrar no Soundify
            </h1>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-transparent border border-spotify-medium-gray rounded-full text-white font-semibold hover:border-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-transparent border border-spotify-medium-gray rounded-full text-white font-semibold hover:border-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Continuar com GitHub
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-transparent border border-spotify-medium-gray rounded-full text-white font-semibold hover:border-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuar com Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-spotify-medium-gray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-spotify-dark-gray text-spotify-text-gray">ou</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email ou nome de usuário
                </label>
                <input
                  type="text"
                  {...register('username')}
                  placeholder="Email ou nome de usuário"
                  className={`w-full px-4 py-3 bg-spotify-light-gray border ${
                    errors.username ? 'border-red-500' : 'border-spotify-medium-gray'
                  } rounded-md text-white placeholder-spotify-text-gray focus:outline-none focus:border-white transition-colors`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Senha"
                    className={`w-full px-4 py-3 pr-12 bg-spotify-light-gray border ${
                      errors.password ? 'border-red-500' : 'border-spotify-medium-gray'
                    } rounded-md text-white placeholder-spotify-text-gray focus:outline-none focus:border-white transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-spotify-text-gray hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-spotify-medium-gray bg-spotify-light-gray text-spotify-green focus:ring-spotify-green"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-white">
                  Lembrar de mim
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-dark hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <a href="#" className="text-white hover:text-spotify-green underline text-sm">
                Esqueceu sua senha?
              </a>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-spotify-medium-gray"></div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-spotify-text-gray">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-white hover:text-spotify-green underline font-semibold">
                  Inscreva-se no Soundify
                </Link>
              </p>
            </div>

            {/* Test Credentials */}
            <div className="mt-6 p-4 bg-spotify-light-gray/50 rounded-lg">
              <p className="text-xs text-spotify-text-gray text-center">
                <strong className="text-white">Credenciais de teste:</strong><br />
                admin / admin123 ou user / user123
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-spotify-text-gray">
          Este site é protegido por reCAPTCHA e a{' '}
          <a href="#" className="underline">Política de Privacidade</a> e os{' '}
          <a href="#" className="underline">Termos de Serviço</a> do Google se aplicam.
        </p>
      </footer>
    </div>
  );
};
