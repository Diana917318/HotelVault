import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("staff"),
  name: text("name").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number").notNull().unique(),
  type: text("type").notNull(),
  status: text("status").notNull().default("available"), // available, occupied, pending, maintenance
  floor: integer("floor").notNull(),
  maxOccupancy: integer("max_occupancy").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  amenities: jsonb("amenities").default("[]"),
  lastCleaned: timestamp("last_cleaned"),
  notes: text("notes"),
});

export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  idNumber: text("id_number"),
  nationality: text("nationality"),
  preferences: jsonb("preferences").default("{}"),
  vipStatus: boolean("vip_status").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id).notNull(),
  guestId: varchar("guest_id").references(() => guests.id).notNull(),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").default(0),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, checked_in, checked_out, cancelled
  channel: text("channel").notNull(), // direct, booking.com, expedia, etc.
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow(),
  cloudbedsSyncId: text("cloudbeds_sync_id"),
});

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  department: text("department").notNull(),
  position: text("position").notNull(),
  shift: text("shift"), // morning, afternoon, night
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").references(() => rooms.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id),
  type: text("type").notNull(), // cleaning, repair, inspection
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // credit_card, cash, bank_transfer
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const guestCommunications = pgTable("guest_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guestId: varchar("guest_id").references(() => guests.id).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  type: text("type").notNull(), // email, sms, in_person, phone
  subject: text("subject"),
  message: text("message").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  status: text("status").notNull().default("sent"), // sent, delivered, read, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const hotelSettings = pgTable("hotel_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  name: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  lastCleaned: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  cloudbedsSyncId: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  stripePaymentId: true,
});

export const insertGuestCommunicationSchema = createInsertSchema(guestCommunications).omit({
  id: true,
  createdAt: true,
});

export const insertHotelSettingSchema = createInsertSchema(hotelSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type GuestCommunication = typeof guestCommunications.$inferSelect;
export type InsertGuestCommunication = z.infer<typeof insertGuestCommunicationSchema>;
export type HotelSetting = typeof hotelSettings.$inferSelect;
export type InsertHotelSetting = z.infer<typeof insertHotelSettingSchema>;
