import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useStore, initAuth } from "@/store/useStore";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import HRPage from "./pages/HRPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = () => (
  <AppLayout>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/hr" element={<HRPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AppLayout>
);

const AppContent = () => {
  const user = useStore((s) => s.user);
  const authLoading = useStore((s) => s.authLoading);
  useEffect(() => { initAuth(); }, []);
  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <LoginPage />;
  return <AuthenticatedApp />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
