import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Store, 
  MessageCircle, 
  User, 
  LogOut,
  Menu,
  Bell
} from 'lucide-react';
import { useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  activeTab?: 'barn' | 'marketplace' | 'community' | 'profile';
}

export default function MainLayout({ children, activeTab }: MainLayoutProps) {
  const { profile, signOut } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    {
      id: 'barn',
      name: 'የኔ እርባታ',
      nameEn: 'My Barn',
      icon: Heart,
      href: '/barn',
      color: 'text-primary'
    },
    {
      id: 'marketplace',
      name: 'ገበያ',
      nameEn: 'Marketplace',
      icon: Store,
      href: '/marketplace',
      color: 'text-secondary'
    },
    {
      id: 'community',
      name: 'ምክር',
      nameEn: 'Community',
      icon: MessageCircle,
      href: '/community',
      color: 'text-accent'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">የ</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-primary">የገበሬ ገበያ</h1>
                <p className="text-xs text-muted-foreground">Yegebere Gebeya</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:block">{item.name}</span>
                  <span className="lg:hidden">{item.nameEn}</span>
                </a>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{profile?.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.role === 'farmer' ? 'Farmer' : 
                     profile?.role === 'vet' ? 'Veterinarian' : 'Admin'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="grid grid-cols-3 gap-2">
                {navigation.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.nameEn}</span>
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border">
        <nav className="grid grid-cols-3 gap-1 p-2">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.nameEn}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}