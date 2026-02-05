import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Lazy loading das páginas
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage').then(m => ({ default: m.ArtistsPage })));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage').then(m => ({ default: m.ArtistDetailPage })));
const ArtistFormPage = lazy(() => import('./pages/ArtistFormPage').then(m => ({ default: m.ArtistFormPage })));
const AlbumsPage = lazy(() => import('./pages/AlbumsPage').then(m => ({ default: m.AlbumsPage })));
const AlbumDetailPage = lazy(() => import('./pages/AlbumDetailPage').then(m => ({ default: m.AlbumDetailPage })));
const AlbumFormPage = lazy(() => import('./pages/AlbumFormPage').then(m => ({ default: m.AlbumFormPage })));

// Loading component with dark theme
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full animate-spin" />
  </div>
);

// Layout wrapper for protected routes
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes with Layout */}
              <Route
                path="/"
                element={
                  <ProtectedLayout>
                    <HomePage />
                  </ProtectedLayout>
                }
              />
              
              <Route
                path="/artists"
                element={
                  <ProtectedLayout>
                    <ArtistsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/artists/new"
                element={
                  <ProtectedLayout>
                    <ArtistFormPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/artists/:id"
                element={
                  <ProtectedLayout>
                    <ArtistDetailPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/artists/:id/edit"
                element={
                  <ProtectedLayout>
                    <ArtistFormPage />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/albums"
                element={
                  <ProtectedLayout>
                    <AlbumsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/albums/new"
                element={
                  <ProtectedLayout>
                    <AlbumFormPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/albums/:id"
                element={
                  <ProtectedLayout>
                    <AlbumDetailPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/albums/:id/edit"
                element={
                  <ProtectedLayout>
                    <AlbumFormPage />
                  </ProtectedLayout>
                }
              />

              {/* Search route */}
              <Route
                path="/search"
                element={
                  <ProtectedLayout>
                    <HomePage />
                  </ProtectedLayout>
                }
              />

              {/* Library route */}
              <Route
                path="/library"
                element={
                  <ProtectedLayout>
                    <AlbumsPage />
                  </ProtectedLayout>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
