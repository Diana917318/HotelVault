import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Booking, type Guest, type Room } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, Search, Calendar, Clock, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { z } from "zod";

const checkInSchema = z.object({
  specialRequests: z.string().optional(),
  estimatedArrival: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

type CheckInData = z.infer<typeof checkInSchema>;

export default function CheckIn() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todaysArrivals, isLoading: arrivalsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/arrivals/today"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: todaysDepartures, isLoading: departuresLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/departures/today"],
    refetchInterval: 30000,
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: guests } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
  });

  const form = useForm<CheckInData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      specialRequests: "",
      estimatedArrival: "",
      paymentMethod: "",
      notes: "",
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: string) => 
      apiRequest("PATCH", `/api/bookings/${bookingId}`, { status: "checked_in" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({ title: "Success", description: "Guest checked in successfully" });
      setIsCheckInDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to check in guest",
        variant: "destructive" 
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingId: string) => 
      apiRequest("PATCH", `/api/bookings/${bookingId}`, { status: "checked_out" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({ title: "Success", description: "Guest checked out successfully" });
      setIsCheckOutDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to check out guest",
        variant: "destructive" 
      });
    },
  });

  const updateRoomStatusMutation = useMutation({
    mutationFn: ({ roomId, status }: { roomId: string; status: string }) => 
      apiRequest("PATCH", `/api/rooms/${roomId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
  });

  const handleCheckIn = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCheckInDialogOpen(true);
  };

  const handleCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCheckOutDialogOpen(true);
  };

  const confirmCheckIn = (data: CheckInData) => {
    if (selectedBooking) {
      checkInMutation.mutate(selectedBooking.id);
      // Update room status to occupied
      updateRoomStatusMutation.mutate({ 
        roomId: selectedBooking.roomId, 
        status: "occupied" 
      });
    }
  };

  const confirmCheckOut = () => {
    if (selectedBooking) {
      checkOutMutation.mutate(selectedBooking.id);
      // Update room status to available (assuming cleaning is done)
      updateRoomStatusMutation.mutate({ 
        roomId: selectedBooking.roomId, 
        status: "available" 
      });
    }
  };

  const getGuestInfo = (guestId: string) => {
    return guests?.find(g => g.id === guestId);
  };

  const getRoomInfo = (roomId: string) => {
    return rooms?.find(r => r.id === roomId);
  };

  const filteredArrivals = todaysArrivals?.filter(booking => {
    if (!searchTerm) return true;
    const guest = getGuestInfo(booking.guestId);
    const room = getRoomInfo(booking.roomId);
    return (
      guest?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredDepartures = todaysDepartures?.filter(booking => {
    if (!searchTerm) return true;
    const guest = getGuestInfo(booking.guestId);
    const room = getRoomInfo(booking.roomId);
    return (
      guest?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room?.number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (arrivalsLoading || departuresLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserCheck className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Check-In / Check-Out</h1>
            <p className="text-gray-600">Manage guest arrivals and departures</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search guests or rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-guests"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Arrivals</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-arrivals">
                  {todaysArrivals?.length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-hotel-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Departures</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-departures">
                  {todaysDepartures?.length || 0}
                </p>
              </div>
              <UserX className="w-8 h-8 text-hotel-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Check-ins</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-pending-checkins">
                  {todaysArrivals?.filter(b => b.status === "confirmed").length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Check-outs</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-pending-checkouts">
                  {todaysDepartures?.filter(b => b.status === "checked_in").length || 0}
                </p>
              </div>
              <UserX className="w-8 h-8 text-hotel-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in and Check-out Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-hotel-blue" />
              <span>Today's Arrivals ({filteredArrivals?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredArrivals?.map((booking) => {
              const guest = getGuestInfo(booking.guestId);
              const room = getRoomInfo(booking.roomId);
              
              return (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-hotel-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {guest?.firstName?.[0]}{guest?.lastName?.[0]}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid={`arrival-guest-${booking.id}`}>
                        {guest?.firstName} {guest?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Room {room?.number} • {room?.type}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        {guest?.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        {guest?.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{guest.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${booking.totalAmount}</p>
                      <Badge 
                        variant={booking.status === "checked_in" ? "default" : "secondary"}
                        className={booking.status === "checked_in" ? "bg-available text-white" : ""}
                      >
                        {booking.status === "checked_in" ? "Checked In" : "Pending"}
                      </Badge>
                    </div>

                    {booking.status === "confirmed" && (
                      <Button
                        onClick={() => handleCheckIn(booking)}
                        className="bg-hotel-blue hover:bg-hotel-blue/90"
                        size="sm"
                        data-testid={`button-checkin-${booking.id}`}
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredArrivals?.length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No arrivals found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Departures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-hotel-green" />
              <span>Today's Departures ({filteredDepartures?.length || 0})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredDepartures?.map((booking) => {
              const guest = getGuestInfo(booking.guestId);
              const room = getRoomInfo(booking.roomId);
              
              return (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-hotel-green rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {guest?.firstName?.[0]}{guest?.lastName?.[0]}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid={`departure-guest-${booking.id}`}>
                        {guest?.firstName} {guest?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Room {room?.number} • {room?.type}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        {guest?.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Check-out: 11:00 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${booking.totalAmount}</p>
                      <Badge 
                        variant={booking.status === "checked_out" ? "default" : "secondary"}
                        className={booking.status === "checked_out" ? "bg-gray-500 text-white" : ""}
                      >
                        {booking.status === "checked_out" ? "Checked Out" : "In House"}
                      </Badge>
                    </div>

                    {booking.status === "checked_in" && (
                      <Button
                        onClick={() => handleCheckOut(booking)}
                        variant="outline"
                        size="sm"
                        className="border-hotel-green text-hotel-green hover:bg-hotel-green hover:text-white"
                        data-testid={`button-checkout-${booking.id}`}
                      >
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredDepartures?.length === 0 && (
              <div className="text-center py-8">
                <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No departures found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in Guest</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">
                  {getGuestInfo(selectedBooking.guestId)?.firstName} {getGuestInfo(selectedBooking.guestId)?.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  Room {getRoomInfo(selectedBooking.roomId)?.number} • {getRoomInfo(selectedBooking.roomId)?.type}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedBooking.checkIn).toLocaleDateString()} - {new Date(selectedBooking.checkOut).toLocaleDateString()}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(confirmCheckIn)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-payment-method">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any special instructions or notes..."
                            data-testid="textarea-checkin-notes"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCheckInDialogOpen(false)}
                      data-testid="button-cancel-checkin"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={checkInMutation.isPending}
                      className="bg-hotel-blue hover:bg-hotel-blue/90"
                      data-testid="button-confirm-checkin"
                    >
                      Confirm Check-in
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={isCheckOutDialogOpen} onOpenChange={setIsCheckOutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check-out Guest</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">
                  {getGuestInfo(selectedBooking.guestId)?.firstName} {getGuestInfo(selectedBooking.guestId)?.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  Room {getRoomInfo(selectedBooking.roomId)?.number} • {getRoomInfo(selectedBooking.roomId)?.type}
                </p>
                <p className="text-sm text-gray-600">
                  Total Amount: ${selectedBooking.totalAmount}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Room charges:</span>
                  <span className="font-medium">${selectedBooking.totalAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Incidentals:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-2 flex items-center justify-between font-semibold">
                  <span>Total:</span>
                  <span>${selectedBooking.totalAmount}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCheckOutDialogOpen(false)}
                  data-testid="button-cancel-checkout"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="bg-hotel-green hover:bg-hotel-green/90"
                  data-testid="button-confirm-checkout"
                >
                  Confirm Check-out
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
