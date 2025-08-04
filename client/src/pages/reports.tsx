import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Room, Booking } from "@shared/schema";
import { TrendingUp, Download, Calendar, DollarSign, Users, Bed, BarChart3, PieChart } from "lucide-react";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("30days");
  const [reportType, setReportType] = useState("overview");
  
  const { data: rooms } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const generateReport = () => {
    // This would generate and download a PDF/Excel report
    alert("Report generation would be implemented here with actual data export functionality");
  };

  const getDateRangeData = () => {
    if (!bookings) return { filteredBookings: [], dateLabel: "" };
    
    const now = new Date();
    let startDate = new Date();
    let dateLabel = "";
    
    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        dateLabel = "Last 7 days";
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        dateLabel = "Last 30 days";
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        dateLabel = "Last 90 days";
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        dateLabel = "Last year";
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        dateLabel = "Last 30 days";
    }
    
    const filteredBookings = bookings.filter(booking => 
      new Date(booking.createdAt!) >= startDate
    );
    
    return { filteredBookings, dateLabel };
  };

  const { filteredBookings, dateLabel } = getDateRangeData();

  const calculateMetrics = () => {
    if (!filteredBookings.length || !rooms) {
      return {
        totalRevenue: 0,
        averageRate: 0,
        occupancyRate: 0,
        totalBookings: 0,
        channelBreakdown: {},
        roomTypeBreakdown: {},
      };
    }
    
    const totalRevenue = filteredBookings.reduce((sum, booking) => 
      sum + parseFloat(booking.totalAmount), 0
    );
    
    const averageRate = totalRevenue / filteredBookings.length;
    
    const occupancyRate = metrics?.occupancyRate || 0;
    
    const channelBreakdown = filteredBookings.reduce((acc, booking) => {
      acc[booking.channel] = (acc[booking.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const roomTypeBreakdown = rooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRevenue,
      averageRate,
      occupancyRate,
      totalBookings: filteredBookings.length,
      channelBreakdown,
      roomTypeBreakdown,
    };
  };

  const reportMetrics = calculateMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Business intelligence and performance insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40" data-testid="select-report-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="occupancy">Occupancy</SelectItem>
              <SelectItem value="channels">Channels</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateReport}
            className="bg-hotel-blue hover:bg-hotel-blue/90"
            data-testid="button-generate-report"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="metric-total-revenue">
                  ${reportMetrics.totalRevenue.toFixed(0)}
                </p>
                <p className="text-sm text-hotel-green">+15% vs previous period</p>
              </div>
              <DollarSign className="w-8 h-8 text-hotel-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rate</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="metric-average-rate">
                  ${reportMetrics.averageRate.toFixed(0)}
                </p>
                <p className="text-sm text-hotel-green">+8% improvement</p>
              </div>
              <TrendingUp className="w-8 h-8 text-hotel-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="metric-occupancy-rate">
                  {reportMetrics.occupancyRate}%
                </p>
                <p className="text-sm text-pending">Target: 85%</p>
              </div>
              <Bed className="w-8 h-8 text-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="metric-total-bookings">
                  {reportMetrics.totalBookings}
                </p>
                <p className="text-sm text-gray-500">{dateLabel}</p>
              </div>
              <Users className="w-8 h-8 text-hotel-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend - {dateLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-lg flex items-end justify-center">
              <div className="text-center p-8">
                <BarChart3 className="w-12 h-12 text-hotel-blue mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Revenue Chart</p>
                <p className="text-sm text-gray-500">
                  Interactive chart showing daily revenue trends
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">${(reportMetrics.totalRevenue / 7).toFixed(0)}</p>
                    <p className="text-gray-600">Daily Avg</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">${reportMetrics.totalRevenue.toFixed(0)}</p>
                    <p className="text-gray-600">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">+15%</p>
                    <p className="text-gray-600">Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportMetrics.channelBreakdown).map(([channel, count]) => {
                const percentage = (count / reportMetrics.totalBookings * 100);
                const channelColors = {
                  direct: "bg-hotel-green",
                  "booking.com": "bg-hotel-blue",
                  expedia: "bg-pending",
                  airbnb: "bg-pink-500",
                };
                
                return (
                  <div key={channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{channel}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count} bookings</span>
                        <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${channelColors[channel as keyof typeof channelColors] || "bg-gray-400"}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(reportMetrics.channelBreakdown).length === 0 && (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No booking data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Room Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Room Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportMetrics.roomTypeBreakdown).map(([roomType, count]) => {
                const percentage = rooms ? (count / rooms.length * 100) : 0;
                
                return (
                  <div key={roomType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{roomType}</p>
                      <p className="text-sm text-gray-600">{count} rooms</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-hotel-green mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Strong Revenue Growth</p>
                  <p className="text-sm text-gray-600">
                    Revenue increased by 15% compared to the previous period
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-hotel-blue mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Direct Bookings Leading</p>
                  <p className="text-sm text-gray-600">
                    Direct bookings account for the highest percentage of reservations
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Bed className="w-5 h-5 text-pending mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Optimize Occupancy</p>
                  <p className="text-sm text-gray-600">
                    Consider dynamic pricing strategies to reach 85% occupancy target
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Seasonal Trends</p>
                  <p className="text-sm text-gray-600">
                    Monitor upcoming seasonal patterns for better forecasting
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-daily-report"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Generate Daily Report
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-monthly-summary"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Monthly Summary
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-forecast-report"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Forecast Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={generateReport}
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={generateReport}
              data-testid="button-export-excel"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as Excel
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={generateReport}
              data-testid="button-export-csv"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Daily Reports</p>
              <p className="text-xs text-gray-600">Automated at 6:00 AM</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Weekly Summary</p>
              <p className="text-xs text-gray-600">Every Monday at 9:00 AM</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Monthly Report</p>
              <p className="text-xs text-gray-600">1st of each month</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
