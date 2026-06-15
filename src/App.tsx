import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Clientes = lazy(() => import("./pages/Clientes").then(m => ({ default: m.Clientes })));
const Servicos = lazy(() => import("./pages/Servicos").then(m => ({ default: m.Servicos })));
const Instalacoes = lazy(() => import("./pages/Instalacoes").then(m => ({ default: m.Instalacoes })));
const Despesas = lazy(() => import("./pages/Despesas"));
const Dividas = lazy(() => import("./pages/Dividas").then(m => ({ default: m.Dividas })));
const Relatorios = lazy(() => import("./pages/Relatorios").then(m => ({ default: m.Relatorios })));
const Agente = lazy(() => import("./pages/Agente").then(m => ({ default: m.Agente })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then(m => ({ default: m.ResetPassword })));
const Perfil = lazy(() => import("./pages/Perfil"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <PWAInstallPrompt />
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Clientes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servicos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Servicos />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/sites" element={<Navigate to="/servicos" replace />} />
              <Route
                path="/instalacoes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Instalacoes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/despesas"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Despesas />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dividas"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dividas />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Relatorios />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agente"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Agente />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Perfil />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Configuracoes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
