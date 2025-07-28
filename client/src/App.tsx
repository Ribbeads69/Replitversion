import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Contacts from "@/pages/contacts";
import Templates from "@/pages/templates";
import Sequences from "@/pages/sequences";
import Campaigns from "@/pages/campaigns";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/templates" component={Templates} />
      <Route path="/sequences" component={Sequences} />
      <Route path="/campaigns" component={Campaigns} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-slate-900">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <Header />
              <div className="flex-1 overflow-auto">
                <Router />
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
