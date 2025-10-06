import { Heart, Store, MessageCircle, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const navigation = [
  {
    id: 'barn',
    name: 'የኔ እርባታ',
    nameEn: 'My Barn',
    icon: Heart,
    href: '/animals',
  },
  {
    id: 'marketplace',
    name: 'ገበያ',
    nameEn: 'Marketplace',
    icon: Store,
    href: '/marketplace',
  },
  {
    id: 'community',
    name: 'ምክር',
    nameEn: 'Community',
    icon: MessageCircle,
    href: '/community',
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { roles } = useUserRole();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const getNavCls = (path: string) =>
    isActive(path) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">የ</span>
              </div>
              <div>
                <h1 className="font-bold text-sm text-primary">የገበሬ ገበያ</h1>
                <p className="text-xs text-muted-foreground">Farm Connect</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">የ</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href} className={getNavCls(item.href)}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{item.nameEn}</span>
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-2">
          {!collapsed && (
            <div className="text-center mb-3">
              <p className="text-sm font-medium">{profile?.display_name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {roles.map(r => r.role).join(', ')}
              </p>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <NotificationCenter />
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
        </div>

        {/* Collapse trigger at bottom */}
        <div className="p-2 border-t border-border">
          <SidebarTrigger className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}