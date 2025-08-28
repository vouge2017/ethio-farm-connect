import { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface GuestModeContextType {
  isGuestMode: boolean;
  triggerAuthModal: (action?: string) => void;
  closeAuthModal: () => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const isGuestMode = !user;

  const triggerAuthModal = (action: string = 'continue') => {
    if (isGuestMode) {
      setAuthAction(action);
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthAction('');
  };

  const handleSignUp = () => {
    navigate('/auth');
    closeAuthModal();
  };

  const value = {
    isGuestMode,
    triggerAuthModal,
    closeAuthModal
  };

  return (
    <GuestModeContext.Provider value={value}>
      {children}
      
      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Up to Continue</DialogTitle>
            <DialogDescription>
              To {authAction}, you need to create an account. Join thousands of Ethiopian farmers on our platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="text-4xl mb-4">🐄</div>
              <h3 className="font-semibold text-lg mb-2">የገበሬ ገበያ</h3>
              <p className="text-sm text-muted-foreground">
                Ethiopia's trusted livestock platform
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleSignUp} className="flex-1">
                Sign Up
              </Button>
              <Button variant="outline" onClick={closeAuthModal} className="flex-1">
                Continue Browsing
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <button 
                  onClick={handleSignUp}
                  className="text-primary hover:underline"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider');
  }
  return context;
}

// Helper hook for protected actions
export function useProtectedAction() {
  const { triggerAuthModal, isGuestMode } = useGuestMode();
  
  const executeProtectedAction = (action: () => void, actionName: string = 'perform this action') => {
    if (isGuestMode) {
      triggerAuthModal(actionName);
    } else {
      action();
    }
  };
  
  return executeProtectedAction;
}