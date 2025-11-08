import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import PersonaForm from "@/pages/persona-form";
import ChatSandbox from "@/pages/chat-sandbox";
import PersonaDeploy from "@/pages/persona-deploy";
import ApiKeys from "@/pages/api-keys";
import Analytics from "@/pages/analytics";

function DashboardLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/personas/new" component={PersonaForm} />
              <Route path="/personas/:id/edit" component={PersonaForm} />
              <Route path="/personas/:id/test" component={ChatSandbox} />
              <Route path="/personas/:id/deploy" component={PersonaDeploy} />
              <Route path="/api-keys" component={ApiKeys} />
              <Route path="/analytics" component={Analytics} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={DashboardLayout} />
        <Route path="/personas/*" component={DashboardLayout} />
        <Route path="/api-keys" component={DashboardLayout} />
        <Route path="/analytics" component={DashboardLayout} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
