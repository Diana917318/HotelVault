import { 
  type User, type InsertUser, type Room, type InsertRoom, 
  type Guest, type InsertGuest, type Booking, type InsertBooking,
  type Staff, type InsertStaff, type MaintenanceRequest, type InsertMaintenanceRequest,
  type Payment, type InsertPayment, type GuestCommunication, type InsertGuestCommunication,
  type HotelSetting, type InsertHotelSetting
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;

  // Room methods
  getRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByNumber(number: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room>;
  updateRoomStatus(id: string, status: string): Promise<Room>;

  // Guest methods
  getGuests(): Promise<Guest[]>;
  getGuest(id: string): Promise<Guest | undefined>;
  getGuestByEmail(email: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, updates: Partial<Guest>): Promise<Guest>;

  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByDateRange(checkIn: Date, checkOut: Date): Promise<Booking[]>;
  getBookingsByGuest(guestId: string): Promise<Booking[]>;
  getBookingsByRoom(roomId: string): Promise<Booking[]>;
  getTodaysArrivals(): Promise<Booking[]>;
  getTodaysDepartures(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking>;

  // Staff methods
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  getActiveStaff(): Promise<Staff[]>;
  createStaffMember(staff: InsertStaff): Promise<Staff>;
  updateStaffMember(id: string, updates: Partial<Staff>): Promise<Staff>;

  // Maintenance methods
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined>;
  getPendingMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest>;

  // Payment methods
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;

  // Guest communication methods
  getGuestCommunications(): Promise<GuestCommunication[]>;
  getGuestCommunication(id: string): Promise<GuestCommunication | undefined>;
  getCommunicationsByGuest(guestId: string): Promise<GuestCommunication[]>;
  createGuestCommunication(communication: InsertGuestCommunication): Promise<GuestCommunication>;

  // Hotel settings methods
  getHotelSettings(): Promise<HotelSetting[]>;
  getHotelSetting(key: string): Promise<HotelSetting | undefined>;
  updateHotelSetting(key: string, value: any): Promise<HotelSetting>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();
  private guests: Map<string, Guest> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private staff: Map<string, Staff> = new Map();
  private maintenanceRequests: Map<string, MaintenanceRequest> = new Map();
  private payments: Map<string, Payment> = new Map();
  private guestCommunications: Map<string, GuestCommunication> = new Map();
  private hotelSettings: Map<string, HotelSetting> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize some sample data for the hotel
    const sampleRooms: Room[] = [
      { id: randomUUID(), number: "101", type: "Standard King", status: "available", floor: 1, maxOccupancy: 2, basePrice: "285.00", amenities: ["WiFi", "TV", "Air Conditioning"], lastCleaned: new Date(), notes: null },
      { id: randomUUID(), number: "102", type: "Standard Twin", status: "occupied", floor: 1, maxOccupancy: 2, basePrice: "275.00", amenities: ["WiFi", "TV", "Air Conditioning"], lastCleaned: new Date(), notes: null },
      { id: randomUUID(), number: "103", type: "Deluxe King", status: "pending", floor: 1, maxOccupancy: 2, basePrice: "350.00", amenities: ["WiFi", "TV", "Air Conditioning", "Harbor View"], lastCleaned: new Date(), notes: null },
      { id: randomUUID(), number: "203", type: "Deluxe King", status: "available", floor: 2, maxOccupancy: 2, basePrice: "350.00", amenities: ["WiFi", "TV", "Air Conditioning", "Harbor View"], lastCleaned: new Date(), notes: null },
      { id: randomUUID(), number: "501", type: "Suite", status: "available", floor: 5, maxOccupancy: 4, basePrice: "550.00", amenities: ["WiFi", "TV", "Air Conditioning", "Harbor View", "Balcony", "Kitchenette"], lastCleaned: new Date(), notes: null },
    ];

    sampleRooms.forEach(room => this.rooms.set(room.id, room));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      stripeCustomerId: null, 
      stripeSubscriptionId: null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: customerId, 
      stripeSubscriptionId: subscriptionId 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Room methods
  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByNumber(number: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.number === number);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { 
      ...insertRoom, 
      id, 
      lastCleaned: null 
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const room = this.rooms.get(id);
    if (!room) throw new Error("Room not found");
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async updateRoomStatus(id: string, status: string): Promise<Room> {
    return this.updateRoom(id, { status });
  }

  // Guest methods
  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async getGuest(id: string): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async getGuestByEmail(email: string): Promise<Guest | undefined> {
    return Array.from(this.guests.values()).find(guest => guest.email === email);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = randomUUID();
    const guest: Guest = { 
      ...insertGuest, 
      id, 
      createdAt: new Date() 
    };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
    const guest = this.guests.get(id);
    if (!guest) throw new Error("Guest not found");
    
    const updatedGuest = { ...guest, ...updates };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByDateRange(checkIn: Date, checkOut: Date): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => 
      booking.checkIn >= checkIn && booking.checkOut <= checkOut
    );
  }

  async getBookingsByGuest(guestId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.guestId === guestId);
  }

  async getBookingsByRoom(roomId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.roomId === roomId);
  }

  async getTodaysArrivals(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.bookings.values()).filter(booking => 
      booking.checkIn >= today && booking.checkIn < tomorrow
    );
  }

  async getTodaysDepartures(): Promise<Booking[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.bookings.values()).filter(booking => 
      booking.checkOut >= today && booking.checkOut < tomorrow
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      cloudbedsSyncId: null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Staff methods
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getActiveStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(member => member.isActive);
  }

  async createStaffMember(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staffMember: Staff = { ...insertStaff, id };
    this.staff.set(id, staffMember);
    return staffMember;
  }

  async updateStaffMember(id: string, updates: Partial<Staff>): Promise<Staff> {
    const staffMember = this.staff.get(id);
    if (!staffMember) throw new Error("Staff member not found");
    
    const updatedStaffMember = { ...staffMember, ...updates };
    this.staff.set(id, updatedStaffMember);
    return updatedStaffMember;
  }

  // Maintenance methods
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values());
  }

  async getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }

  async getPendingMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(request => request.status === "pending");
  }

  async createMaintenanceRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const id = randomUUID();
    const request: MaintenanceRequest = { 
      ...insertRequest, 
      id, 
      createdAt: new Date(),
      completedAt: null
    };
    this.maintenanceRequests.set(id, request);
    return request;
  }

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const request = this.maintenanceRequests.get(id);
    if (!request) throw new Error("Maintenance request not found");
    
    const updatedRequest = { ...request, ...updates };
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.bookingId === bookingId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt: new Date(),
      processedAt: null,
      stripePaymentId: null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Guest communication methods
  async getGuestCommunications(): Promise<GuestCommunication[]> {
    return Array.from(this.guestCommunications.values());
  }

  async getGuestCommunication(id: string): Promise<GuestCommunication | undefined> {
    return this.guestCommunications.get(id);
  }

  async getCommunicationsByGuest(guestId: string): Promise<GuestCommunication[]> {
    return Array.from(this.guestCommunications.values()).filter(comm => comm.guestId === guestId);
  }

  async createGuestCommunication(insertCommunication: InsertGuestCommunication): Promise<GuestCommunication> {
    const id = randomUUID();
    const communication: GuestCommunication = { 
      ...insertCommunication, 
      id, 
      createdAt: new Date() 
    };
    this.guestCommunications.set(id, communication);
    return communication;
  }

  // Hotel settings methods
  async getHotelSettings(): Promise<HotelSetting[]> {
    return Array.from(this.hotelSettings.values());
  }

  async getHotelSetting(key: string): Promise<HotelSetting | undefined> {
    return Array.from(this.hotelSettings.values()).find(setting => setting.key === key);
  }

  async updateHotelSetting(key: string, value: any): Promise<HotelSetting> {
    const existing = await this.getHotelSetting(key);
    
    if (existing) {
      const updated = { ...existing, value, updatedAt: new Date() };
      this.hotelSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const setting: HotelSetting = { 
        id, 
        key, 
        value, 
        updatedAt: new Date() 
      };
      this.hotelSettings.set(id, setting);
      return setting;
    }
  }
}

export const storage = new MemStorage();
