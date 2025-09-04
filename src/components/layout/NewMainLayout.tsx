import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "react-router-dom";
import { Heart, Store, MessageCircle } from "lucide-react";

interface NewMainLayoutProps {
  children: ReactNode;
}

const mobileNavigation = [
  {
    id: 'barn',
    nameEn: 'Barn',
    icon: Heart,
    href: '/animals',
  },
  {
    id: 'marketplace',
    nameEn: 'Market',
    icon: Store,
    href: '/marketplace',
  },
  {
    id: 'community',
    nameEn: 'Community',
    icon: MessageCircle,
    href: '/community',
  },
];

export default function NewMainLayout({ children }: NewMainLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">የ</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg text-primary">የገበሬ ገበያ</h1>
                  <p className="text-xs text-muted-foreground">Farm Connect</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
          <nav className="grid grid-cols-3 gap-1 p-2 max-w-md mx-auto">
            {mobileNavigation.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.nameEn}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header with sidebar trigger */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              Welcome to Ethiopian Farm Connect
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}