import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import ReloadPrompt from "@/components/ReloadPrompt";
import type { User } from "@/types";
import type { Database } from "@/types/database";

const Login = lazy(() => import("./pages/Login"));
const AdminLayout = lazy(() => import("./pages/AdminLayout"));
const LivreurLayout = lazy(() => import("./pages/LivreurLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminLivreurs = lazy(() => import("./pages/admin/Livreurs"));
const AdminCourses = lazy(() => import("./pages/admin/Courses"));
const AdminValidations = lazy(() => import("./pages/admin/Validations"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));
const AdminExpenses = lazy(() => import("./pages/admin/Expenses"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const LivreurCourses = lazy(() => import("./pages/livreur/Courses"));
const LivreurExpenses = lazy(() => import("./pages/livreur/Expenses"));
const LivreurSummary = lazy(() => import("./pages/livreur/Summary"));
const LivreurHistoryPage = lazy(() => import("./pages/livreur/History"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "livreur";
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userProfile) {
            type DbUser = Database['public']['Tables']['users']['Row'];
            const profile = userProfile as DbUser;
            setUser({
              id: profile.id,
              name: profile.name,
              role: profile.role as 'admin' | 'livreur',
            });
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
          } else if (session?.user) {
            const { data: userProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userProfile) {
              type DbUser = Database['public']['Tables']['users']['Row'];
              const profile = userProfile as DbUser;
              setUser({
                id: profile.id,
                name: profile.name,
                role: profile.role as 'admin' | 'livreur',
              });
            }
          }
        });
        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        console.error('Auth listener setup error:', err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ReloadPrompt />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="livreurs" element={<AdminLivreurs />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="validations" element={<AdminValidations />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="expenses" element={<AdminExpenses />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route
              path="/livreur"
              element={
                <ProtectedRoute requiredRole="livreur">
                  <LivreurLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<LivreurCourses />} />
              <Route path="history" element={<LivreurHistoryPage />} />
              <Route path="expenses" element={<LivreurExpenses />} />
              <Route path="summary" element={<LivreurSummary />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
