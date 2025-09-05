import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GuestModeProvider } from "@/hooks/useGuestMode";
import NewMainLayout from "./components/layout/NewMainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Animals from "./pages/Animals";
import Marketplace from "./pages/Marketplace";
import Community from "./pages/Community";
import DailyTips from "./pages/DailyTips";
import Veterinarians from "./pages/Veterinarians";
import CreateListing from "./pages/marketplace/CreateListing";
import ListingDetail from "./pages/listings/ListingDetail";
import MessagingHub from "./pages/messaging/MessagingHub";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GuestModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <NewMainLayout>
              <Index />
            </NewMainLayout>
          } />
          <Route path="/animals" element={
            <NewMainLayout>
              <Animals />
            </NewMainLayout>
          } />
          <Route path="/marketplace" element={
            <NewMainLayout>
              <Marketplace />
            </NewMainLayout>
          } />
          <Route path="/marketplace/create" element={
            <NewMainLayout>
              <CreateListing />
            </NewMainLayout>
          } />
          <Route path="/listings/:listingId" element={
            <NewMainLayout>
              <ListingDetail />
            </NewMainLayout>
          } />
          <Route path="/messages" element={
            <NewMainLayout>
              <MessagingHub />
            </NewMainLayout>
          } />
          <Route path="/admin" element={
            <NewMainLayout>
              <AdminDashboard />
            </NewMainLayout>
          } />
          <Route path="/community" element={
            <NewMainLayout>
              <Community />
            </NewMainLayout>
          } />
          <Route path="/daily-tips" element={
            <NewMainLayout>
              <DailyTips />
            </NewMainLayout>
          } />
          <Route path="/veterinarians" element={
            <NewMainLayout>
              <Veterinarians />
            </NewMainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </GuestModeProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
