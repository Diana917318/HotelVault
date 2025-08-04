import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { insertPaymentSchema, type Payment, type InsertPayment, type Booking, type Guest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Search, Filter, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react";
import { useEffect } from "react";

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const PaymentForm = ({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Payment processed successfully!",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe} 
        className="w-full bg-hotel-blue hover:bg-hotel-blue/90"
        data-testid="button-process-payment"
      >
        Process Payment
      </Button>
    </form>
  );
};

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: guests } = useQuery<Guest[]>({
    queryKey: ["/api/guests"],
  });

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      bookingId: "",
      amount: "0",
      method: "credit_card",
      status: "pending",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: InsertPayment) => apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Success", description: "Payment record created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create payment record",
        variant: "destructive" 
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) => 
      apiRequest("PATCH", `/api/payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Success", description: "Payment updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update payment",
        variant: "destructive" 
      });
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: (data: { amount: number }) => apiRequest("POST", "/api/create-payment-intent", data),
    onSuccess: (response: any) => {
      setClientSecret(response.clientSecret);
      setIsStripeDialogOpen(true);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to initialize payment",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (data: InsertPayment) => {
    createPaymentMutation.mutate(data);
  };

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    const updateData: Partial<Payment> = { status: newStatus };
    if (newStatus === "completed") {
      updateData.processedAt = new Date();
    }
    updatePaymentMutation.mutate({ 
      id: paymentId, 
      data: updateData
    });
  };

  const initiateStripePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    createPaymentIntentMutation.mutate({ 
      amount: parseFloat(booking.totalAmount) 
    });
  };

  const filteredPayments = payments?.filter(payment => {
    const booking = bookings?.find(b => b.id === payment.bookingId);
    const guest = guests?.find(g => g.id === booking?.guestId);
    
    const matchesSearch = 
      guest?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking?.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      completed: { label: "Completed", className: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { label: "Failed", className: "bg-red-100 text-red-800", icon: AlertCircle },
      refunded: { label: "Refunded", className: "bg-gray-100 text-gray-800", icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      credit_card: { label: "Credit Card", className: "bg-blue-100 text-blue-800" },
      cash: { label: "Cash", className: "bg-green-100 text-green-800" },
      bank_transfer: { label: "Bank Transfer", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.credit_card;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStats = () => {
    if (!payments) return { total: 0, completed: 0, pending: 0, totalAmount: 0 };
    
    const total = payments.length;
    const completed = payments.filter(p => p.status === "completed").length;
    const pending = payments.filter(p => p.status === "pending").length;
    const totalAmount = payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    return { total, completed, pending, totalAmount };
  };

  const stats = getPaymentStats();

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
          <CreditCard className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Process and manage hotel payments</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-hotel-blue hover:bg-hotel-blue/90" data-testid="button-add-payment">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bookingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-booking">
                            <SelectValue placeholder="Select booking" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookings?.map(booking => {
                              const guest = guests?.find(g => g.id === booking.guestId);
                              return (
                                <SelectItem key={booking.id} value={booking.id}>
                                  {guest?.firstName} {guest?.lastName} - ${booking.totalAmount}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (AUD)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0.00" data-testid="input-amount" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-method">
                            <SelectValue />
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

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPaymentMutation.isPending}
                    data-testid="button-record-payment"
                  >
                    Record Payment
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-payments">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-500">All transactions</p>
              </div>
              <CreditCard className="w-8 h-8 text-hotel-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-completed-payments">
                  {stats.completed}
                </p>
                <p className="text-sm text-hotel-green">Successful transactions</p>
              </div>
              <CheckCircle className="w-8 h-8 text-hotel-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-pending-payments">
                  {stats.pending}
                </p>
                <p className="text-sm text-pending">Awaiting processing</p>
              </div>
              <Clock className="w-8 h-8 text-pending" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-revenue">
                  ${stats.totalAmount.toFixed(0)}
                </p>
                <p className="text-sm text-hotel-green">Processed payments</p>
              </div>
              <DollarSign className="w-8 h-8 text-hotel-red" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-payments"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-40" data-testid="select-method-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments?.map((payment) => {
          const booking = bookings?.find(b => b.id === payment.bookingId);
          const guest = guests?.find(g => g.id === booking?.guestId);
          
          return (
            <Card key={payment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-hotel-blue rounded-full flex items-center justify-center">
                      <CreditCard className="text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900" data-testid={`payment-guest-${payment.id}`}>
                          {guest?.firstName} {guest?.lastName}
                        </h3>
                        {getStatusBadge(payment.status)}
                        {getMethodBadge(payment.method)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Booking ID: {booking?.id.slice(0, 8)}...
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Created: {new Date(payment.createdAt!).toLocaleDateString()}</span>
                        {payment.processedAt && (
                          <span>Processed: {new Date(payment.processedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900" data-testid={`payment-amount-${payment.id}`}>
                        ${payment.amount}
                      </p>
                      <p className="text-sm text-gray-600">AUD</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select 
                        value={payment.status} 
                        onValueChange={(value) => handleStatusChange(payment.id, value)}
                        disabled={payment.status === "completed" || payment.status === "refunded"}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-payment-status-${payment.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {booking && payment.status === "pending" && stripePromise && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => initiateStripePayment(booking)}
                          data-testid={`button-process-stripe-${payment.id}`}
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPayments?.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" || methodFilter !== "all"
              ? "Try adjusting your search or filter criteria" 
              : "No payment records available"
            }
          </p>
        </div>
      )}

      {/* Stripe Payment Dialog */}
      {stripePromise && (
        <Dialog open={isStripeDialogOpen} onOpenChange={setIsStripeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">
                    Payment for {guests?.find(g => g.id === selectedBooking.guestId)?.firstName} {guests?.find(g => g.id === selectedBooking.guestId)?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Amount: ${selectedBooking.totalAmount} AUD
                  </p>
                </div>

                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm 
                      clientSecret={clientSecret} 
                      onSuccess={() => {
                        setIsStripeDialogOpen(false);
                        setClientSecret("");
                        setSelectedBooking(null);
                        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
                      }}
                    />
                  </Elements>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
