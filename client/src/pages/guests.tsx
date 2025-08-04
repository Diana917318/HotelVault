import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGuestCommunicationSchema, type Guest, type GuestCommunication, type InsertGuestCommunication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Plus, Search, Filter, Phone, Mail, Send, User, Star } from "lucide-react";

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vipFilter, setVipFilter] = useState("all");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: guests, isLoading } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
  });

  const { data: communications } = useQuery<GuestCommunication[]>({
    queryKey: ["/api/communications"],
  });

  const form = useForm<InsertGuestCommunication>({
    resolver: zodResolver(insertGuestCommunicationSchema),
    defaultValues: {
      guestId: "",
      type: "email",
      subject: "",
      message: "",
      direction: "outbound",
      status: "sent",
    },
  });

  const sendCommunicationMutation = useMutation({
    mutationFn: (data: InsertGuestCommunication) => apiRequest("POST", "/api/communications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/communications"] });
      toast({ title: "Success", description: "Message sent successfully" });
      setIsCommunicationDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send message",
        variant: "destructive" 
      });
    },
  });

  const handleSendMessage = (data: InsertGuestCommunication) => {
    if (selectedGuest) {
      sendCommunicationMutation.mutate({
        ...data,
        guestId: selectedGuest.id,
      });
    }
  };

  const openCommunicationDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    form.setValue("guestId", guest.id);
    setIsCommunicationDialogOpen(true);
  };

  const filteredGuests = guests?.filter(guest => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVip = vipFilter === "all" || 
                      (vipFilter === "vip" && guest.vipStatus) ||
                      (vipFilter === "regular" && !guest.vipStatus);
    
    return matchesSearch && matchesVip;
  });

  const getGuestCommunications = (guestId: string) => {
    return communications?.filter(comm => comm.guestId === guestId) || [];
  };

  const getGuestStats = () => {
    if (!guests) return { total: 0, vip: 0, regular: 0, recentMessages: 0 };
    
    const total = guests.length;
    const vip = guests.filter(guest => guest.vipStatus).length;
    const regular = total - vip;
    
    // Recent messages in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentMessages = communications?.filter(comm => 
      new Date(comm.createdAt!) > weekAgo
    ).length || 0;
    
    return { total, vip, regular, recentMessages };
  };

  const stats = getGuestStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <MessageCircle className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guest Communication</h1>
            <p className="text-gray-600">Manage guest relationships and communications</p>
          </div>
        </div>
        
        <Button 
          className="bg-hotel-blue hover:bg-hotel-blue/90"
          onClick={() => setIsCommunicationDialogOpen(true)}
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </div>

      {/* Guest Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-guests">
                  {stats.total}
                </p>
                <p className="text-sm text-hotel-green">+12% this month</p>
              </div>
              <User className="w-8 h-8 text-hotel-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VIP Guests</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-vip-guests">
                  {stats.vip}
                </p>
                <p className="text-sm text-pending">{((stats.vip / stats.total) * 100).toFixed(0)}% of total</p>
              </div>
              <Star className="w-8 h-8 text-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Guests</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-regular-guests">
                  {stats.regular}
                </p>
                <p className="text-sm text-gray-500">Standard members</p>
              </div>
              <User className="w-8 h-8 text-hotel-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Messages</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-recent-messages">
                  {stats.recentMessages}
                </p>
                <p className="text-sm text-gray-500">Last 7 days</p>
              </div>
              <MessageCircle className="w-8 h-8 text-hotel-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-guests"
          />
        </div>
        
        <Select value={vipFilter} onValueChange={setVipFilter}>
          <SelectTrigger className="w-48" data-testid="select-vip-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Guests</SelectItem>
            <SelectItem value="vip">VIP Guests</SelectItem>
            <SelectItem value="regular">Regular Guests</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guest List */}
      <div className="space-y-4">
        {filteredGuests?.map((guest) => {
          const guestComms = getGuestCommunications(guest.id);
          const lastCommunication = guestComms
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
          
          return (
            <Card key={guest.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-hotel-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {guest.firstName[0]}{guest.lastName[0]}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900" data-testid={`guest-name-${guest.id}`}>
                          {guest.firstName} {guest.lastName}
                        </h3>
                        {guest.vipStatus && (
                          <Badge className="bg-pending text-white">
                            <Star className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{guest.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        {guest.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        {guest.nationality && (
                          <span>{guest.nationality}</span>
                        )}
                        <span>Member since {new Date(guest.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {guestComms.length} messages
                      </p>
                      {lastCommunication && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(lastCommunication.createdAt!).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `tel:${guest.phone}`}
                        disabled={!guest.phone}
                        data-testid={`button-call-${guest.id}`}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `mailto:${guest.email}`}
                        data-testid={`button-email-${guest.id}`}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => openCommunicationDialog(guest)}
                        className="bg-hotel-blue hover:bg-hotel-blue/90"
                        size="sm"
                        data-testid={`button-message-${guest.id}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {lastCommunication && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Last Message:</span> {lastCommunication.subject || "No subject"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {lastCommunication.message.substring(0, 100)}
                      {lastCommunication.message.length > 100 && "..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredGuests?.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || vipFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No guests registered yet"
            }
          </p>
        </div>
      )}

      {/* Send Message Dialog */}
      <Dialog open={isCommunicationDialogOpen} onOpenChange={setIsCommunicationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedGuest 
                ? `Send Message to ${selectedGuest.firstName} ${selectedGuest.lastName}` 
                : "Send Message"
              }
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
              {!selectedGuest && (
                <FormField
                  control={form.control}
                  name="guestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Guest</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-message-guest">
                            <SelectValue placeholder="Choose a guest" />
                          </SelectTrigger>
                          <SelectContent>
                            {guests?.map(guest => (
                              <SelectItem key={guest.id} value={guest.id}>
                                {guest.firstName} {guest.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-communication-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="in_person">In Person</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Message subject..." data-testid="input-message-subject" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Type your message here..."
                        className="min-h-[100px]"
                        data-testid="textarea-message-content"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCommunicationDialogOpen(false)}
                  data-testid="button-cancel-message"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={sendCommunicationMutation.isPending}
                  className="bg-hotel-blue hover:bg-hotel-blue/90"
                  data-testid="button-send-message-confirm"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
