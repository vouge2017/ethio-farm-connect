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
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Community Coming Soon</h1>
                <p className="text-muted-foreground">Q&A forum and daily tips will be available here.</p>
              </div>
            </NewMainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </GuestModeProvider>
  </AuthProvider>
);

export default App;
