import { Link, useLocation } from "wouter";
import { 
  ChartBar, 
  Bed, 
  CalendarCheck, 
  UserCheck, 
  DollarSign, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Wrench, 
  CreditCard, 
  Smartphone, 
  Settings as SettingsIcon,
  Hotel,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: ChartBar },
  { path: "/rooms", label: "Room Management", icon: Bed },
  { path: "/bookings", label: "Bookings", icon: CalendarCheck },
  { path: "/checkin", label: "Check-In/Out", icon: UserCheck },
  { path: "/pricing", label: "Pricing & Inventory", icon: DollarSign },
  { path: "/guests", label: "Guest Communication", icon: MessageCircle },
  { path: "/reports", label: "Reports & Analytics", icon: TrendingUp },
  { path: "/staff", label: "Staff Management", icon: Users },
  { path: "/maintenance", label: "Maintenance", icon: Wrench },
  { path: "/payments", label: "Payments", icon: CreditCard },
  { path: "/mobile", label: "Mobile Booking", icon: Smartphone },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-hotel-blue rounded-lg flex items-center justify-center">
            <Hotel className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sydney Harbor Hotel</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'text-hotel-blue bg-blue-50' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              data-testid={`nav-${item.path.slice(1)}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      {/* User Info */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-hotel-blue rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">James Miller</p>
            <p className="text-xs text-gray-500">Hotel Manager</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
