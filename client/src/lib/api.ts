import { apiRequest } from "./queryClient";

// Hotel Data API Functions
export const hotelApi = {
  // Rooms
  getRooms: () => apiRequest("GET", "/api/rooms"),
  getRoom: (id: string) => apiRequest("GET", `/api/rooms/${id}`),
  createRoom: (data: any) => apiRequest("POST", "/api/rooms", data),
  updateRoom: (id: string, data: any) => apiRequest("PATCH", `/api/rooms/${id}`, data),
  updateRoomStatus: (id: string, status: string) => apiRequest("PATCH", `/api/rooms/${id}/status`, { status }),

  // Bookings
  getBookings: () => apiRequest("GET", "/api/bookings"),
  getBooking: (id: string) => apiRequest("GET", `/api/bookings/${id}`),
  getTodaysArrivals: () => apiRequest("GET", "/api/bookings/arrivals/today"),
  getTodaysDepartures: () => apiRequest("GET", "/api/bookings/departures/today"),
  createBooking: (data: any) => apiRequest("POST", "/api/bookings", data),
  updateBooking: (id: string, data: any) => apiRequest("PATCH", `/api/bookings/${id}`, data),

  // Guests
  getGuests: () => apiRequest("GET", "/api/guests"),
  getGuest: (id: string) => apiRequest("GET", `/api/guests/${id}`),
  createGuest: (data: any) => apiRequest("POST", "/api/guests", data),
  updateGuest: (id: string, data: any) => apiRequest("PATCH", `/api/guests/${id}`, data),

  // Staff
  getStaff: () => apiRequest("GET", "/api/staff"),
  getActiveStaff: () => apiRequest("GET", "/api/staff/active"),
  getStaffMember: (id: string) => apiRequest("GET", `/api/staff/${id}`),
  createStaffMember: (data: any) => apiRequest("POST", "/api/staff", data),
  updateStaffMember: (id: string, data: any) => apiRequest("PATCH", `/api/staff/${id}`, data),

  // Maintenance
  getMaintenanceRequests: () => apiRequest("GET", "/api/maintenance"),
  getPendingMaintenanceRequests: () => apiRequest("GET", "/api/maintenance/pending"),
  getMaintenanceRequest: (id: string) => apiRequest("GET", `/api/maintenance/${id}`),
  createMaintenanceRequest: (data: any) => apiRequest("POST", "/api/maintenance", data),
  updateMaintenanceRequest: (id: string, data: any) => apiRequest("PATCH", `/api/maintenance/${id}`, data),

  // Payments
  getPayments: () => apiRequest("GET", "/api/payments"),
  getPayment: (id: string) => apiRequest("GET", `/api/payments/${id}`),
  getPaymentsByBooking: (bookingId: string) => apiRequest("GET", `/api/payments/booking/${bookingId}`),
  createPayment: (data: any) => apiRequest("POST", "/api/payments", data),
  updatePayment: (id: string, data: any) => apiRequest("PATCH", `/api/payments/${id}`, data),
  createPaymentIntent: (data: { amount: number }) => apiRequest("POST", "/api/create-payment-intent", data),

  // Guest Communications
  getCommunications: () => apiRequest("GET", "/api/communications"),
  getCommunicationsByGuest: (guestId: string) => apiRequest("GET", `/api/communications/guest/${guestId}`),
  createCommunication: (data: any) => apiRequest("POST", "/api/communications", data),

  // Settings
  getSettings: () => apiRequest("GET", "/api/settings"),
  getSetting: (key: string) => apiRequest("GET", `/api/settings/${key}`),
  updateSetting: (key: string, value: any) => apiRequest("PUT", `/api/settings/${key}`, { value }),

  // Dashboard & Analytics
  getDashboardMetrics: () => apiRequest("GET", "/api/dashboard/metrics"),

  // Cloudbeds Integration
  getCloudbedsStatus: () => apiRequest("GET", "/api/cloudbeds/sync-status"),
  syncCloudbeds: () => apiRequest("POST", "/api/cloudbeds/sync"),
};

// Mobile Booking API Functions
export const mobileApi = {
  searchRooms: (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }) => {
    const searchParams = new URLSearchParams({
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      adults: params.adults.toString(),
      children: params.children.toString(),
    });
    return apiRequest("GET", `/api/rooms/search?${searchParams.toString()}`);
  },

  createMobileBooking: (data: {
    roomId: string;
    guestData: any;
    bookingData: any;
  }) => apiRequest("POST", "/api/bookings/mobile", data),

  getAvailableRooms: (date?: string) => {
    const params = date ? `?date=${date}` : "";
    return apiRequest("GET", `/api/rooms/available${params}`);
  },
};

// Authentication API Functions
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiRequest("POST", "/api/auth/login", credentials),
  
  logout: () => apiRequest("POST", "/api/auth/logout"),
  
  getCurrentUser: () => apiRequest("GET", "/api/auth/me"),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest("POST", "/api/auth/change-password", data),
};

// Reporting API Functions
export const reportingApi = {
  getOccupancyReport: (params: { startDate: string; endDate: string }) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest("GET", `/api/reports/occupancy?${searchParams.toString()}`);
  },

  getRevenueReport: (params: { startDate: string; endDate: string }) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest("GET", `/api/reports/revenue?${searchParams.toString()}`);
  },

  getBookingChannelReport: (params: { startDate: string; endDate: string }) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest("GET", `/api/reports/channels?${searchParams.toString()}`);
  },

  exportReport: (type: string, format: string, params: any) => {
    const searchParams = new URLSearchParams({ ...params, format });
    return apiRequest("GET", `/api/reports/${type}/export?${searchParams.toString()}`);
  },
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error("API Error:", error);
  
  if (error.response?.status === 401) {
    // Handle unauthorized access
    window.location.href = "/login";
    return;
  }
  
  if (error.response?.status === 403) {
    // Handle forbidden access
    throw new Error("You don't have permission to perform this action");
  }
  
  if (error.response?.status >= 500) {
    // Handle server errors
    throw new Error("Server error. Please try again later.");
  }
  
  // Handle other errors
  throw new Error(error.message || "An unexpected error occurred");
};

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Sydney-specific hotel utilities
export const sydneyHotelUtils = {
  formatAustralianPhone: (phone: string) => {
    // Format phone numbers for Australian standards
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("61")) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.startsWith("0")) {
      return `+61 ${cleaned.slice(1, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  },

  formatAustralianCurrency: (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  },

  getSydneyDateTime: () => {
    return new Date().toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  },

  getBusinessHours: () => {
    return {
      checkIn: "15:00",
      checkOut: "11:00",
      frontDesk: {
        open: "06:00",
        close: "23:00",
      },
      concierge: {
        open: "07:00",
        close: "22:00",
      },
    };
  },

  getTourismInfo: () => {
    return {
      nearbyAttractions: [
        "Sydney Opera House (5 min walk)",
        "Sydney Harbour Bridge (10 min walk)",
        "Royal Botanic Gardens (8 min walk)",
        "The Rocks Markets (12 min walk)",
        "Circular Quay Ferry Terminal (3 min walk)",
      ],
      transportOptions: [
        "Circular Quay Train Station (5 min walk)",
        "Bus Routes: 380, 392, 394, 397",
        "Ferry services to Manly, Parramatta",
        "Taxi rank outside hotel",
        "Uber pickup zone Level B2",
      ],
    };
  },
};
