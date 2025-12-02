import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import LivreurLayout from "./pages/LivreurLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLivreurs from "./pages/admin/Livreurs";
import AdminCourses from "./pages/admin/Courses";
import AdminValidations from "./pages/admin/Validations";
import AdminPayments from "./pages/admin/Payments";
import AdminExpenses from "./pages/admin/Expenses";
import AdminReports from "./pages/admin/Reports";
import LivreurCourses from "./pages/livreur/Courses";
import LivreurExpenses from "./pages/livreur/Expenses";
import LivreurSummary from "./pages/livreur/Summary";
import NotFound from "./pages/NotFound";
import { getCurrentUser } from "./services/storage";
import ReloadPrompt from "@/components/ReloadPrompt";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "livreur";
}) => {
  const user = getCurrentUser();

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
            <Route path="expenses" element={<LivreurExpenses />} />
            <Route path="summary" element={<LivreurSummary />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
