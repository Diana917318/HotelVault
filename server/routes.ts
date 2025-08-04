import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertRoomSchema, insertGuestSchema, insertBookingSchema, 
  insertStaffSchema, insertMaintenanceRequestSchema, insertPaymentSchema,
  insertGuestCommunicationSchema, insertHotelSettingSchema
} from "@shared/schema";

// Initialize Stripe if secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Room management routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedRoom = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedRoom);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.updateRoom(req.params.id, req.body);
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/rooms/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const room = await storage.updateRoomStatus(req.params.id, status);
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Guest management routes
  app.get("/api/guests", async (req, res) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/guests/:id", async (req, res) => {
    try {
      const guest = await storage.getGuest(req.params.id);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/guests", async (req, res) => {
    try {
      const validatedGuest = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(validatedGuest);
      res.status(201).json(guest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/guests/:id", async (req, res) => {
    try {
      const guest = await storage.updateGuest(req.params.id, req.body);
      res.json(guest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Booking management routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/arrivals/today", async (req, res) => {
    try {
      const arrivals = await storage.getTodaysArrivals();
      res.json(arrivals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/departures/today", async (req, res) => {
    try {
      const departures = await storage.getTodaysDepartures();
      res.json(departures);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedBooking = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedBooking);
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Staff management routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getStaff();
      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/staff/active", async (req, res) => {
    try {
      const activeStaff = await storage.getActiveStaff();
      res.json(activeStaff);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const validatedStaff = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaffMember(validatedStaff);
      res.status(201).json(staffMember);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/staff/:id", async (req, res) => {
    try {
      const staffMember = await storage.updateStaffMember(req.params.id, req.body);
      res.json(staffMember);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Maintenance routes
  app.get("/api/maintenance", async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/maintenance/pending", async (req, res) => {
    try {
      const pendingRequests = await storage.getPendingMaintenanceRequests();
      res.json(pendingRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const validatedRequest = insertMaintenanceRequestSchema.parse(req.body);
      const request = await storage.createMaintenanceRequest(validatedRequest);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/maintenance/:id", async (req, res) => {
    try {
      const request = await storage.updateMaintenanceRequest(req.params.id, req.body);
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payments/booking/:bookingId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByBooking(req.params.bookingId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedPayment = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedPayment);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe payment intent route
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ message: "Stripe not configured. Please set STRIPE_SECRET_KEY environment variable." });
    }

    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "aud", // Australian Dollar for Sydney hotel
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Guest communication routes
  app.get("/api/communications", async (req, res) => {
    try {
      const communications = await storage.getGuestCommunications();
      res.json(communications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/communications/guest/:guestId", async (req, res) => {
    try {
      const communications = await storage.getCommunicationsByGuest(req.params.guestId);
      res.json(communications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/communications", async (req, res) => {
    try {
      const validatedCommunication = insertGuestCommunicationSchema.parse(req.body);
      const communication = await storage.createGuestCommunication(validatedCommunication);
      res.status(201).json(communication);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Hotel settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getHotelSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getHotelSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateHotelSetting(req.params.key, value);
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard analytics routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      const bookings = await storage.getBookings();
      const todaysArrivals = await storage.getTodaysArrivals();
      const maintenanceRequests = await storage.getPendingMaintenanceRequests();

      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(room => room.status === "occupied").length;
      const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

      // Calculate today's revenue (simplified)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysBookings = bookings.filter(booking => {
        const checkIn = new Date(booking.checkIn);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn.getTime() === today.getTime();
      });
      
      const revenue = todaysBookings.reduce((sum, booking) => 
        sum + parseFloat(booking.totalAmount), 0
      );

      res.json({
        occupancyRate,
        revenue: revenue.toFixed(2),
        pendingCheckins: todaysArrivals.length,
        maintenanceRequests: maintenanceRequests.length,
        totalRooms,
        occupiedRooms,
        availableRooms: rooms.filter(room => room.status === "available").length,
        maintenanceRooms: rooms.filter(room => room.status === "maintenance").length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cloudbeds integration endpoints (architecture ready)
  app.get("/api/cloudbeds/sync-status", async (req, res) => {
    try {
      // TODO: Implement actual Cloudbeds API integration
      // This endpoint should check the last sync time with Cloudbeds
      res.json({
        lastSync: new Date().toISOString(),
        status: "connected",
        nextSync: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cloudbeds/sync", async (req, res) => {
    try {
      // TODO: Implement Cloudbeds sync functionality
      // This should sync room availability, bookings, and pricing with Cloudbeds
      res.json({
        success: true,
        syncedAt: new Date().toISOString(),
        syncedItems: {
          rooms: 85,
          bookings: 23,
          rates: 15
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
