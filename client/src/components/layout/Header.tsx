import { Bell, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Header() {
  const [lastSync, setLastSync] = useState("2 min ago");

  const { data: syncStatus } = useQuery({
    queryKey: ["/api/cloudbeds/sync-status"],
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    setLastSync("Just now");
    // Trigger manual sync
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-AU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Cloudbeds Sync Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-available rounded-full animate-pulse"></div>
              <span className="text-gray-600">Cloudbeds Synced</span>
              <span className="text-gray-400">{lastSync}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                data-testid="button-refresh-sync"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
              >
                3
              </Badge>
            </Button>
            
            {/* Quick Actions */}
            <Button 
              className="bg-hotel-blue text-white hover:bg-hotel-blue/90"
              data-testid="button-quick-checkin"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Check-In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
