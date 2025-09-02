import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GuestModeProvider } from "@/hooks/useGuestMode";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Animals from "./pages/Animals";
import Marketplace from "./pages/Marketplace";
import CreateListing from "./pages/marketplace/CreateListing";
import ListingDetail from "./pages/listings/ListingDetail";
import MessagingHub from "./pages/messaging/MessagingHub";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <GuestModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/create" element={<CreateListing />} />
          <Route path="/listings/:listingId" element={<ListingDetail />} />
          <Route path="/messages" element={<MessagingHub />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </GuestModeProvider>
  </AuthProvider>
);

export default App;
