import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Room, Booking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Smartphone, 
  Calendar, 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Utensils, 
  Dumbbell,
  Star,
  QrCode,
  CheckCircle,
  Clock,
  User,
  CreditCard
} from "lucide-react";

const mobileBookingSchema = z.object({
  roomType: z.string().min(1, "Room type is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  adults: z.number().min(1, "At least 1 adult required"),
  children: z.number().min(0),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  specialRequests: z.string().optional(),
});

type MobileBookingData = z.infer<typeof mobileBookingSchema>;

export default function Mobile() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { toast } = useToast();

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: recentBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const form = useForm<MobileBookingData>({
    resolver: zodResolver(mobileBookingSchema),
    defaultValues: {
      roomType: "",
      checkIn: "",
      checkOut: "",
      adults: 2,
      children: 0,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialRequests: "",
    },
  });

  const handleRoomSelection = (room: Room) => {
    setSelectedRoom(room);
    form.setValue("roomType", room.type);
    setCurrentStep(2);
  };

  const handleBookingSubmit = (data: MobileBookingData) => {
    // In a real app, this would create the booking
    toast({
      title: "Booking Request Submitted",
      description: "We'll confirm your reservation shortly via email and SMS.",
    });
    setIsBookingDialogOpen(false);
    form.reset();
    setCurrentStep(1);
    setSelectedRoom(null);
  };

  const availableRooms = rooms?.filter(room => room.status === "available");

  const roomAmenities = {
    "Standard King": ["Wifi", "Coffee", "AC"],
    "Standard Twin": ["Wifi", "Coffee", "AC"],
    "Deluxe King": ["Wifi", "Coffee", "AC", "Harbor View"],
    "Deluxe Twin": ["Wifi", "Coffee", "AC", "Harbor View"],
    "Suite": ["Wifi", "Coffee", "AC", "Harbor View", "Balcony", "Kitchenette"],
    "Executive Suite": ["Wifi", "Coffee", "AC", "Harbor View", "Balcony", "Kitchenette", "Butler Service"],
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      "Wifi": Wifi,
      "Coffee": Coffee,
      "AC": Clock,
      "Harbor View": MapPin,
      "Balcony": MapPin,
      "Kitchenette": Utensils,
      "Butler Service": User,
    };
    return icons[amenity] || Star;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mobile Booking</h1>
            <p className="text-gray-600">Optimized mobile experience for direct bookings</p>
          </div>
        </div>
        
        <Button 
          className="bg-hotel-blue hover:bg-hotel-blue/90"
          onClick={() => setIsBookingDialogOpen(true)}
          data-testid="button-start-booking"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Start Booking
        </Button>
      </div>

      {/* Mobile Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Bookings</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-mobile-bookings">
                  68%
                </p>
                <p className="text-sm text-hotel-green">Of total bookings</p>
              </div>
              <Smartphone className="w-8 h-8 text-hotel-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Direct Bookings</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-direct-bookings">
                  42%
                </p>
                <p className="text-sm text-hotel-green">Mobile conversion</p>
              </div>
              <CheckCircle className="w-8 h-8 text-hotel-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Booking Time</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-booking-time">
                  3.2
                </p>
                <p className="text-sm text-gray-500">Minutes</p>
              </div>
              <Clock className="w-8 h-8 text-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Revenue</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-mobile-revenue">
                  $245K
                </p>
                <p className="text-sm text-hotel-green">This month</p>
              </div>
              <CreditCard className="w-8 h-8 text-hotel-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Room Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-hotel-blue" />
              <span>Quick Room Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Check-in</label>
                <Input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  data-testid="input-mobile-checkin"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Check-out</label>
                <Input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  data-testid="input-mobile-checkout"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Adults</label>
                <Select value={guests.adults.toString()} onValueChange={(value) => setGuests(prev => ({ ...prev, adults: parseInt(value) }))}>
                  <SelectTrigger data-testid="select-mobile-adults">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Children</label>
                <Select value={guests.children.toString()} onValueChange={(value) => setGuests(prev => ({ ...prev, children: parseInt(value) }))}>
                  <SelectTrigger data-testid="select-mobile-children">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full bg-hotel-blue hover:bg-hotel-blue/90" data-testid="button-search-rooms">
              Search Available Rooms
            </Button>
          </CardContent>
        </Card>

        {/* Available Rooms Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms ({availableRooms?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
            {availableRooms?.slice(0, 3).map(room => (
              <div key={room.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Room {room.number}</h3>
                  <Badge variant="outline" className="bg-available text-white">Available</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{room.type}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {roomAmenities[room.type as keyof typeof roomAmenities]?.slice(0, 3).map((amenity, index) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <Icon key={index} className="w-4 h-4 text-gray-500" title={amenity} />
                      );
                    })}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-hotel-blue">${room.basePrice}</p>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Optimization Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contactless Check-in */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-hotel-blue" />
              <span>Contactless Check-in</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Guests can check in using their mobile device by scanning a QR code
              </p>
              <Button variant="outline" className="w-full" data-testid="button-generate-qr">
                Generate QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-hotel-blue" />
              <span>Mobile Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Apple Pay</span>
                <Badge className="bg-hotel-green text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Google Pay</span>
                <Badge className="bg-hotel-green text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">PayPal</span>
                <Badge className="bg-hotel-green text-white">Active</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-payment-settings">
              Payment Settings
            </Button>
          </CardContent>
        </Card>

        {/* Guest Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-hotel-blue" />
              <span>Mobile Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-room-service">
                <Utensils className="w-4 h-4 mr-2" />
                Room Service Menu
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-concierge">
                <User className="w-4 h-4 mr-2" />
                Concierge Chat
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-housekeeping">
                <Clock className="w-4 h-4 mr-2" />
                Housekeeping Request
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-amenities">
                <Dumbbell className="w-4 h-4 mr-2" />
                Hotel Amenities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Direct Booking Incentives */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Booking Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-hotel-green rounded-full flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free WiFi</h3>
              <p className="text-sm text-gray-600">Complimentary high-speed internet</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-hotel-blue rounded-full flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Welcome Drink</h3>
              <p className="text-sm text-gray-600">Complimentary beverage on arrival</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-pending rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Valet Parking</h3>
              <p className="text-sm text-gray-600">Discounted parking rates</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-hotel-red rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Room Upgrade</h3>
              <p className="text-sm text-gray-600">Subject to availability</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mobile Booking - Step {currentStep} of 3</DialogTitle>
          </DialogHeader>
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Select Your Room</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {availableRooms?.map(room => (
                  <div 
                    key={room.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleRoomSelection(room)}
                    data-testid={`room-option-${room.number}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Room {room.number}</h4>
                      <span className="font-bold text-hotel-blue">${room.basePrice}/night</span>
                    </div>
                    <p className="text-sm text-gray-600">{room.type}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {roomAmenities[room.type as keyof typeof roomAmenities]?.slice(0, 3).map((amenity, index) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <Icon key={index} className="w-4 h-4 text-gray-500" title={amenity} />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && selectedRoom && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Booking Details</h3>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium">Room {selectedRoom.number} - {selectedRoom.type}</h4>
                <p className="text-sm text-gray-600">${selectedRoom.basePrice} per night</p>
              </div>
              
              <Form {...form}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-booking-checkin" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-booking-checkout" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adults</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-booking-adults"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-booking-children"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-hotel-blue hover:bg-hotel-blue/90"
                    data-testid="button-continue-to-guest-info"
                  >
                    Continue to Guest Information
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Guest Information</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-hotel-blue hover:bg-hotel-blue/90"
                      data-testid="button-complete-booking"
                    >
                      Complete Booking
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
