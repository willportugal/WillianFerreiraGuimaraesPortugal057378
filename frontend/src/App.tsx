import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Loading } from './components/ui/Loading';

// Lazy loading das páginas
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage').then(m => ({ default: m.ArtistsPage })));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage').then(m => ({ default: m.ArtistDetailPage })));
const ArtistFormPage = lazy(() => import('./pages/ArtistFormPage').then(m => ({ default: m.ArtistFormPage })));
const AlbumsPage = lazy(() => import('./pages/AlbumsPage').then(m => ({ default: m.AlbumsPage })));
const AlbumDetailPage = lazy(() => import('./pages/AlbumDetailPage').then(m => ({ default: m.AlbumDetailPage })));
const AlbumFormPage = lazy(() => import('./pages/AlbumFormPage').then(m => ({ default: m.AlbumFormPage })));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<Loading fullScreen />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/artists"
                element={
                  <ProtectedRoute>
                    <ArtistsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/artists/new"
                element={
                  <ProtectedRoute>
                    <ArtistFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/artists/:id"
                element={
                  <ProtectedRoute>
                    <ArtistDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/artists/:id/edit"
                element={
                  <ProtectedRoute>
                    <ArtistFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/albums"
                element={
                  <ProtectedRoute>
                    <AlbumsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums/new"
                element={
                  <ProtectedRoute>
                    <AlbumFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums/:id"
                element={
                  <ProtectedRoute>
                    <AlbumDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums/:id/edit"
                element={
                  <ProtectedRoute>
                    <AlbumFormPage />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/artists" replace />} />
              <Route path="*" element={<Navigate to="/artists" replace />} />
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
            theme="light"
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
