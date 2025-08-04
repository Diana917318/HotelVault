import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Rooms from "@/pages/rooms";
import Bookings from "@/pages/bookings";
import CheckIn from "@/pages/checkin";
import Pricing from "@/pages/pricing";
import Guests from "@/pages/guests";
import Reports from "@/pages/reports";
import Staff from "@/pages/staff";
import Maintenance from "@/pages/maintenance";
import Payments from "@/pages/payments";
import Mobile from "@/pages/mobile";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/checkin" component={CheckIn} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/guests" component={Guests} />
            <Route path="/reports" component={Reports} />
            <Route path="/staff" component={Staff} />
            <Route path="/maintenance" component={Maintenance} />
            <Route path="/payments" component={Payments} />
            <Route path="/mobile" component={Mobile} />
            <Route path="/settings" component={Settings} />
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
