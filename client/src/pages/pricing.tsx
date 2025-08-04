import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Room } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Calendar, Settings, Plus, Edit } from "lucide-react";
import { z } from "zod";

const pricingRuleSchema = z.object({
  roomType: z.string().min(1, "Room type is required"),
  basePrice: z.string().min(1, "Base price is required"),
  weekendMultiplier: z.string().optional(),
  seasonalMultiplier: z.string().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type PricingRuleData = z.infer<typeof pricingRuleSchema>;

export default function Pricing() {
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const form = useForm<PricingRuleData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      roomType: "",
      basePrice: "",
      weekendMultiplier: "1.2",
      seasonalMultiplier: "1.0",
    },
  });

  const updateRoomPriceMutation = useMutation({
    mutationFn: ({ roomId, price }: { roomId: string; price: string }) => 
      apiRequest("PATCH", `/api/rooms/${roomId}`, { basePrice: price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({ title: "Success", description: "Room price updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update price",
        variant: "destructive" 
      });
    },
  });

  const handlePriceUpdate = (roomId: string, newPrice: string) => {
    updateRoomPriceMutation.mutate({ roomId, price: newPrice });
  };

  const handleBulkPriceUpdate = (data: PricingRuleData) => {
    const filteredRooms = rooms?.filter(room => 
      data.roomType === "all" || room.type === data.roomType
    );

    filteredRooms?.forEach(room => {
      const newPrice = parseFloat(data.basePrice);
      const weekendMultiplier = parseFloat(data.weekendMultiplier || "1.0");
      const seasonalMultiplier = parseFloat(data.seasonalMultiplier || "1.0");
      
      // Simple pricing logic - can be enhanced with more sophisticated rules
      const finalPrice = (newPrice * weekendMultiplier * seasonalMultiplier).toFixed(2);
      
      updateRoomPriceMutation.mutate({ roomId: room.id, price: finalPrice });
    });

    setIsPricingDialogOpen(false);
    form.reset();
  };

  const roomTypes = [...new Set(rooms?.map(room => room.type))];
  
  const filteredRooms = rooms?.filter(room => 
    selectedRoomType === "all" || room.type === selectedRoomType
  );

  const getPricingStats = () => {
    if (!rooms) return { avgPrice: 0, minPrice: 0, maxPrice: 0, totalRevenue: 0 };
    
    const prices = rooms.map(room => parseFloat(room.basePrice));
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Calculate potential total revenue (simplified)
    const totalRevenue = prices.reduce((sum, price) => sum + price, 0) * 30; // Monthly potential
    
    return { avgPrice, minPrice, maxPrice, totalRevenue };
  };

  const stats = getPricingStats();

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
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pricing & Inventory</h1>
            <p className="text-gray-600">Manage room rates and revenue optimization</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
            <SelectTrigger className="w-48" data-testid="select-room-type-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              {roomTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-hotel-blue hover:bg-hotel-blue/90" data-testid="button-bulk-pricing">
                <Settings className="w-4 h-4 mr-2" />
                Bulk Pricing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Price Update</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleBulkPriceUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="roomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-bulk-room-type">
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Room Types</SelectItem>
                              {roomTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price (AUD)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.00" data-testid="input-base-price" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weekendMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekend Multiplier</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1.2" data-testid="input-weekend-multiplier" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seasonalMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seasonal Multiplier</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="1.0" data-testid="input-seasonal-multiplier" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsPricingDialogOpen(false)}
                      data-testid="button-cancel-bulk"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateRoomPriceMutation.isPending}
                      data-testid="button-apply-bulk-pricing"
                    >
                      Apply Pricing
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pricing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rate</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-avg-rate">
                  ${stats.avgPrice.toFixed(0)}
                </p>
                <p className="text-sm text-hotel-green">+8% vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-hotel-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Price Range</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-price-range">
                  ${stats.minPrice.toFixed(0)} - ${stats.maxPrice.toFixed(0)}
                </p>
                <p className="text-sm text-gray-500">Per night</p>
              </div>
              <DollarSign className="w-8 h-8 text-hotel-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Potential</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-revenue-potential">
                  ${(stats.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-500">Monthly</p>
              </div>
              <Calendar className="w-8 h-8 text-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-rooms">
                  {rooms?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Active inventory</p>
              </div>
              <Settings className="w-8 h-8 text-hotel-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room Pricing ({filteredRooms?.length || 0} rooms)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRooms?.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-hotel-blue rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">{room.number}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Room {room.number}</h3>
                    <p className="text-sm text-gray-600">{room.type}</p>
                    <p className="text-xs text-gray-500">
                      Floor {room.floor} • Max {room.maxOccupancy} guests
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900" data-testid={`price-${room.number}`}>
                      ${room.basePrice}
                    </p>
                    <p className="text-sm text-gray-600">per night</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={room.basePrice}
                      className="w-24"
                      onBlur={(e) => {
                        if (e.target.value !== room.basePrice) {
                          handlePriceUpdate(room.id, e.target.value);
                        }
                      }}
                      data-testid={`input-price-${room.number}`}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRoom(room);
                        setIsPricingDialogOpen(true);
                      }}
                      data-testid={`button-edit-price-${room.number}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms?.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600">Try adjusting your room type filter</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Pricing Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-hotel-blue mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">High Demand Period</p>
                  <p className="text-sm text-gray-600">
                    Consider increasing rates by 15-20% for next weekend due to local events
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-hotel-green mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Seasonal Adjustment</p>
                  <p className="text-sm text-gray-600">
                    Summer season approaching - optimal time to adjust base rates
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-pending mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Competitor Analysis</p>
                  <p className="text-sm text-gray-600">
                    Your rates are 12% below market average for similar properties
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current ADR</span>
                <span className="font-medium">${stats.avgPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Optimal ADR</span>
                <span className="font-medium text-hotel-green">${(stats.avgPrice * 1.15).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Opportunity</span>
                <span className="font-medium text-hotel-blue">
                  +${((stats.avgPrice * 0.15) * (rooms?.length || 0) * 30).toFixed(0)}/month
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                className="w-full bg-hotel-green hover:bg-hotel-green/90"
                data-testid="button-apply-optimization"
              >
                Apply Optimization
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
