import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RoomStatusGrid from "@/components/ui/room-status-grid";
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  User,
  UserCheck,
  Plus,
  FileText,
  Wrench,
  CreditCard,
  Sun,
  ExternalLink,
} from "lucide-react";

interface DashboardMetrics {
  occupancyRate: number;
  revenue: string;
  pendingCheckins: number;
  maintenanceRequests: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } =
    useQuery<DashboardMetrics>({
      queryKey: ["/api/dashboard/metrics"],
      refetchInterval: 30000, // Refresh every 30 seconds
    });

  const { data: todaysArrivals } = useQuery({
    queryKey: ["/api/bookings/arrivals/today"],
  });

  const { data: todaysDepartures } = useQuery({
    queryKey: ["/api/bookings/departures/today"],
  });

  const { data: maintenanceRequests } = useQuery({
    queryKey: ["/api/maintenance/pending"],
  });

  if (metricsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Occupancy Rate
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="metric-occupancy"
                >
                  {metrics?.occupancyRate || 0}%
                </p>
                <p className="text-sm text-hotel-green">+5% from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-hotel-blue text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Revenue Today
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="metric-revenue"
                >
                  ${metrics?.revenue || "0.00"}
                </p>
                <p className="text-sm text-hotel-green">+12% vs target</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-hotel-green text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Check-ins
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="metric-checkins"
                >
                  {metrics?.pendingCheckins || 0}
                </p>
                <p className="text-sm text-pending">6 early arrivals</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-pending text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Maintenance Requests
                </p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="metric-maintenance"
                >
                  {metrics?.maintenanceRequests || 0}
                </p>
                <p className="text-sm text-hotel-red">2 urgent</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-hotel-red text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Grid & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomStatusGrid />

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Arrivals ({todaysArrivals?.length || 0})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                {todaysArrivals
                  ?.slice(0, 3)
                  .map((arrival: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-hotel-blue text-xs" />
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium text-gray-900"
                            data-testid={`arrival-guest-${index}`}
                          >
                            Guest {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            Room {200 + index}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">2:30 PM</p>
                        <Badge variant="secondary" className="text-xs">
                          Confirmed
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Departures ({todaysDepartures?.length || 0})
              </h4>
              <div className="space-y-2">
                {todaysDepartures
                  ?.slice(0, 2)
                  .map((departure: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="text-hotel-green text-xs" />
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium text-gray-900"
                            data-testid={`departure-guest-${index}`}
                          >
                            Departure {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            Room {100 + index}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">11:00 AM</p>
                        <Badge
                          variant="outline"
                          className="text-xs text-hotel-green"
                        >
                          Checked Out
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions, Alerts & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between p-3 h-auto bg-blue-50 hover:bg-blue-100 border-blue-200"
              data-testid="action-new-reservation"
            >
              <div className="flex items-center space-x-3">
                <Plus className="text-hotel-blue" />
                <span className="text-sm font-medium text-gray-900">
                  New Reservation
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between p-3 h-auto bg-green-50 hover:bg-green-100 border-green-200"
              data-testid="action-guest-checkin"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="text-hotel-green" />
                <span className="text-sm font-medium text-gray-900">
                  Guest Check-In
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between p-3 h-auto bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
              data-testid="action-room-maintenance"
            >
              <div className="flex items-center space-x-3">
                <Wrench className="text-pending" />
                <span className="text-sm font-medium text-gray-900">
                  Room Maintenance
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between p-3 h-auto bg-purple-50 hover:bg-purple-100 border-purple-200"
              data-testid="action-generate-report"
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  Generate Report
                </span>
              </div>
              <span className="text-gray-400">→</span>
            </Button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="text-hotel-red mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Room 305 - HVAC Issue
                </p>
                <p className="text-xs text-gray-600">
                  Guest reported heating not working
                </p>
                <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-pending mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Late Check-out Request
                </p>
                <p className="text-xs text-gray-600">
                  Room 410 - until 2:00 PM
                </p>
                <p className="text-xs text-gray-500 mt-1">12 minutes ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              {/* <RefreshCw className="text-hotel-blue mt-0.5 flex-shrink-0" /> */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Cloudbeds Sync Complete
                </p>
                <p className="text-xs text-gray-600">
                  All booking data updated
                </p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sydney Weather & Info */}
        <Card>
          <CardHeader>
            <CardTitle>Sydney Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
                alt="Sydney Opera House"
                className="rounded-lg w-full h-32 object-cover mb-3"
              />
              <div className="flex items-center justify-center space-x-2">
                <Sun className="text-yellow-500 text-2xl" />
                <span className="text-3xl font-bold text-gray-900">22°C</span>
              </div>
              <p className="text-sm text-gray-600">Sunny, Clear Sky</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Local Events</span>
                <span className="text-gray-900">3 nearby</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Transport Status</span>
                <span className="text-hotel-green">Normal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time</span>
                <span className="text-gray-900" data-testid="current-time">
                  {new Date().toLocaleTimeString("en-AU", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Australia/Sydney",
                  })}{" "}
                  AEDT
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
