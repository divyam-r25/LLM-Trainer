import { Home, Sparkles, BarChart3, Key, Settings, LogOut, User as UserIcon, Plus, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import logoImage from "@assets/8bfed827-52ba-46fb-8296-0158062c5b28_1762612473771.jpg";
import { useQuery } from "@tanstack/react-query";
import type { Persona } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Create Persona",
    url: "/create",
    icon: Plus,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "API Keys",
    url: "/api-keys",
    icon: Key,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: personas = [] } = useQuery<Persona[]>({
    queryKey: ["/api/personas"],
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      // Clear the auth query cache before redirecting
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Use a small delay to ensure cache is cleared before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="ForgeAI" className="w-8 h-8 object-contain" />
          <span className="text-lg font-semibold">ForgeAI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && personas.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>My Personas</SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[300px]">
                <SidebarMenu>
                  {personas.slice(0, 10).map((persona) => (
                    <SidebarMenuItem key={persona.id} className="sidebar-persona-glow">
                      <SidebarMenuButton asChild isActive={location === `/chat/${persona.id}`}>
                        <Link href={`/chat/${persona.id}`} data-testid={`link-persona-${persona.id}`}>
                          <MessageSquare className="w-4 h-4" />
                          <span className="truncate">{persona.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
              {personas.length > 10 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  +{personas.length - 10} more in dashboard
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      {isAuthenticated && user && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 w-full rounded-md hover-elevate p-2 transition-all"
                data-testid="button-user-menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.email || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium truncate w-full">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {user.email}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
