
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LightningProvider } from "./contexts/LightningContext";
import { WaxWalletProvider } from "./contexts/WaxWalletContext";
import { NetworkStatus } from "./components/ui/network-status";
import { NetworkHealth } from "./components/ui/network-health";
import { useSessionPersistence } from "./hooks/useSessionPersistence";
import Index from "./pages/Index";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on network errors
        if (error instanceof Error && error.message.includes('fetch')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/game" element={<Game />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  useSessionPersistence();
  
  return (
    <>
      <NetworkStatus />
      <NetworkHealth />
      <Toaster />
      <Sonner />
      <AppRouter />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <WaxWalletProvider>
          <LightningProvider>
            <AppContent />
          </LightningProvider>
        </WaxWalletProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
