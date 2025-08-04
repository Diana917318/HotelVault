import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { 
  Room, 
  Booking, 
  Guest, 
  Staff, 
  MaintenanceRequest, 
  Payment, 
  GuestCommunication,
  HotelSetting
} from "@shared/schema";

// Custom hook for centralized hotel data management
export function useHotelData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Room data hooks
  const useRooms = () => {
    return useQuery<Room[]>({
      queryKey: ["/api/rooms"],
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useRoom = (id: string) => {
    return useQuery<Room>({
      queryKey: ["/api/rooms", id],
      enabled: !!id,
    });
  };

  const useAvailableRooms = () => {
    const { data: rooms } = useRooms();
    return rooms?.filter(room => room.status === "available") || [];
  };

  // Booking data hooks
  const useBookings = () => {
    return useQuery<Booking[]>({
      queryKey: ["/api/bookings"],
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const useTodaysArrivals = () => {
    return useQuery<Booking[]>({
      queryKey: ["/api/bookings/arrivals/today"],
      refetchInterval: 30 * 1000, // 30 seconds
    });
  };

  const useTodaysDepartures = () => {
    return useQuery<Booking[]>({
      queryKey: ["/api/bookings/departures/today"],
      refetchInterval: 30 * 1000, // 30 seconds
    });
  };

  // Guest data hooks
  const useGuests = () => {
    return useQuery<Guest[]>({
      queryKey: ["/api/guests"],
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useVipGuests = () => {
    const { data: guests } = useGuests();
    return guests?.filter(guest => guest.vipStatus) || [];
  };

  // Staff data hooks
  const useStaff = () => {
    return useQuery<Staff[]>({
      queryKey: ["/api/staff"],
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  const useActiveStaff = () => {
    return useQuery<Staff[]>({
      queryKey: ["/api/staff/active"],
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Maintenance data hooks
  const useMaintenanceRequests = () => {
    return useQuery<MaintenanceRequest[]>({
      queryKey: ["/api/maintenance"],
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const usePendingMaintenance = () => {
    return useQuery<MaintenanceRequest[]>({
      queryKey: ["/api/maintenance/pending"],
      refetchInterval: 60 * 1000, // 1 minute
    });
  };

  // Payment data hooks
  const usePayments = () => {
    return useQuery<Payment[]>({
      queryKey: ["/api/payments"],
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Communication data hooks
  const useCommunications = () => {
    return useQuery<GuestCommunication[]>({
      queryKey: ["/api/communications"],
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Settings data hooks
  const useSettings = () => {
    return useQuery<HotelSetting[]>({
      queryKey: ["/api/settings"],
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  // Dashboard metrics hook
  const useDashboardMetrics = () => {
    return useQuery({
      queryKey: ["/api/dashboard/metrics"],
      refetchInterval: 30 * 1000, // 30 seconds
      staleTime: 15 * 1000, // 15 seconds
    });
  };

  // Cloudbeds integration hooks
  const useCloudbedsStatus = () => {
    return useQuery({
      queryKey: ["/api/cloudbeds/sync-status"],
      refetchInterval: 60 * 1000, // 1 minute
    });
  };

  // Room status utilities
  const getRoomStatusCounts = () => {
    const { data: rooms } = useRooms();
    if (!rooms) return { available: 0, occupied: 0, pending: 0, maintenance: 0, total: 0 };
    
    return rooms.reduce((counts, room) => {
      counts[room.status as keyof typeof counts]++;
      counts.total++;
      return counts;
    }, { available: 0, occupied: 0, pending: 0, maintenance: 0, total: 0 });
  };

  // Booking utilities
  const getBookingsByStatus = (status: string) => {
    const { data: bookings } = useBookings();
    return bookings?.filter(booking => booking.status === status) || [];
  };

  const getBookingsByChannel = () => {
    const { data: bookings } = useBookings();
    if (!bookings) return {};
    
    return bookings.reduce((channels, booking) => {
      channels[booking.channel] = (channels[booking.channel] || 0) + 1;
      return channels;
    }, {} as Record<string, number>);
  };

  // Revenue calculations
  const calculateRevenue = (timeframe: 'today' | 'week' | 'month' = 'today') => {
    const { data: bookings } = useBookings();
    if (!bookings) return 0;

    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return bookings
      .filter(booking => 
        booking.status === 'completed' && 
        new Date(booking.createdAt!) >= startDate
      )
      .reduce((total, booking) => total + parseFloat(booking.totalAmount), 0);
  };

  // Guest analytics
  const getGuestStats = () => {
    const { data: guests } = useGuests();
    const { data: communications } = useCommunications();
    
    if (!guests) return { total: 0, vip: 0, recentCommunications: 0 };
    
    const total = guests.length;
    const vip = guests.filter(guest => guest.vipStatus).length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCommunications = communications?.filter(comm => 
      new Date(comm.createdAt!) > weekAgo
    ).length || 0;
    
    return { total, vip, recentCommunications };
  };

  // Occupancy calculations
  const calculateOccupancyRate = () => {
    const roomCounts = getRoomStatusCounts();
    if (roomCounts.total === 0) return 0;
    return Math.round((roomCounts.occupied / roomCounts.total) * 100);
  };

  // Average daily rate calculation
  const calculateADR = () => {
    const { data: bookings } = useBookings();
    if (!bookings || bookings.length === 0) return 0;
    
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    if (completedBookings.length === 0) return 0;
    
    const totalRevenue = completedBookings.reduce((sum, booking) => 
      sum + parseFloat(booking.totalAmount), 0
    );
    
    return totalRevenue / completedBookings.length;
  };

  // RevPAR (Revenue Per Available Room) calculation
  const calculateRevPAR = () => {
    const roomCounts = getRoomStatusCounts();
    const todayRevenue = calculateRevenue('today');
    
    if (roomCounts.total === 0) return 0;
    return todayRevenue / roomCounts.total;
  };

  // Maintenance analytics
  const getMaintenanceStats = () => {
    const { data: requests } = useMaintenanceRequests();
    if (!requests) return { total: 0, pending: 0, urgent: 0, completed: 0 };
    
    return {
      total: requests.length,
      pending: requests.filter(req => req.status === 'pending').length,
      urgent: requests.filter(req => req.priority === 'urgent').length,
      completed: requests.filter(req => req.status === 'completed').length,
    };
  };

  // Staff analytics
  const getStaffStats = () => {
    const { data: staff } = useStaff();
    if (!staff) return { total: 0, active: 0, departments: 0 };
    
    return {
      total: staff.length,
      active: staff.filter(member => member.isActive).length,
      departments: new Set(staff.map(member => member.department)).size,
    };
  };

  // Payment analytics
  const getPaymentStats = () => {
    const { data: payments } = usePayments();
    if (!payments) return { total: 0, completed: 0, pending: 0, totalAmount: 0 };
    
    return {
      total: payments.length,
      completed: payments.filter(p => p.status === 'completed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      totalAmount: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0),
    };
  };

  // Real-time data refresh utilities
  const refreshAllData = () => {
    const keys = [
      ["/api/rooms"],
      ["/api/bookings"],
      ["/api/guests"],
      ["/api/staff"],
      ["/api/maintenance"],
      ["/api/payments"],
      ["/api/dashboard/metrics"],
    ];
    
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
    
    toast({
      title: "Data Refreshed",
      description: "All hotel data has been updated successfully.",
    });
  };

  // Sydney-specific utilities
  const getSydneyTime = () => {
    return new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatAUDCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  // Mobile booking utilities
  const getMobileStats = () => {
    const { data: bookings } = useBookings();
    if (!bookings) return { mobileBookings: 0, directBookings: 0, totalBookings: 0 };
    
    const totalBookings = bookings.length;
    const directBookings = bookings.filter(booking => booking.channel === 'direct').length;
    // Assuming 68% of bookings are mobile based on industry standards
    const mobileBookings = Math.round(totalBookings * 0.68);
    
    return { mobileBookings, directBookings, totalBookings };
  };

  return {
    // Data hooks
    useRooms,
    useRoom,
    useAvailableRooms,
    useBookings,
    useTodaysArrivals,
    useTodaysDepartures,
    useGuests,
    useVipGuests,
    useStaff,
    useActiveStaff,
    useMaintenanceRequests,
    usePendingMaintenance,
    usePayments,
    useCommunications,
    useSettings,
    useDashboardMetrics,
    useCloudbedsStatus,
    
    // Analytics and calculations
    getRoomStatusCounts,
    getBookingsByStatus,
    getBookingsByChannel,
    calculateRevenue,
    calculateOccupancyRate,
    calculateADR,
    calculateRevPAR,
    getGuestStats,
    getMaintenanceStats,
    getStaffStats,
    getPaymentStats,
    getMobileStats,
    
    // Utilities
    refreshAllData,
    getSydneyTime,
    formatAUDCurrency,
  };
}

// Individual hook exports for specific use cases
export const useRoomManagement = () => {
  const hotelData = useHotelData();
  return {
    rooms: hotelData.useRooms(),
    availableRooms: hotelData.useAvailableRooms(),
    statusCounts: hotelData.getRoomStatusCounts(),
  };
};

export const useBookingManagement = () => {
  const hotelData = useHotelData();
  return {
    bookings: hotelData.useBookings(),
    todaysArrivals: hotelData.useTodaysArrivals(),
    todaysDepartures: hotelData.useTodaysDepartures(),
    getByStatus: hotelData.getBookingsByStatus,
    getByChannel: hotelData.getBookingsByChannel,
  };
};

export const useHotelAnalytics = () => {
  const hotelData = useHotelData();
  return {
    occupancyRate: hotelData.calculateOccupancyRate(),
    adr: hotelData.calculateADR(),
    revpar: hotelData.calculateRevPAR(),
    revenue: {
      today: hotelData.calculateRevenue('today'),
      week: hotelData.calculateRevenue('week'),
      month: hotelData.calculateRevenue('month'),
    },
    guestStats: hotelData.getGuestStats(),
    maintenanceStats: hotelData.getMaintenanceStats(),
    staffStats: hotelData.getStaffStats(),
    paymentStats: hotelData.getPaymentStats(),
    mobileStats: hotelData.getMobileStats(),
  };
};

export const useDashboardData = () => {
  const hotelData = useHotelData();
  const metrics = hotelData.useDashboardMetrics();
  const cloudbedsStatus = hotelData.useCloudbedsStatus();
  
  return {
    metrics: metrics.data,
    isLoading: metrics.isLoading,
    cloudbedsStatus: cloudbedsStatus.data,
    roomCounts: hotelData.getRoomStatusCounts(),
    todaysArrivals: hotelData.useTodaysArrivals().data,
    todaysDepartures: hotelData.useTodaysDepartures().data,
    refreshData: hotelData.refreshAllData,
    sydneyTime: hotelData.getSydneyTime(),
  };
};
