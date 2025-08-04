import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { HotelSetting } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Hotel, 
  Wifi, 
  Shield, 
  Bell, 
  CreditCard, 
  Smartphone,
  Users,
  Mail,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const hotelSettingsSchema = z.object({
  hotelName: z.string().min(1, "Hotel name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Valid website URL is required").optional().or(z.literal("")),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  currency: z.string(),
  timezone: z.string(),
  defaultRoomRate: z.string(),
  taxRate: z.string(),
});

const integrationSettingsSchema = z.object({
  cloudbedsEnabled: z.boolean(),
  cloudbedsApiKey: z.string().optional(),
  stripeEnabled: z.boolean(),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  twilioEnabled: z.boolean(),
  twilioSid: z.string().optional(),
  twilioToken: z.string().optional(),
  emailEnabled: z.boolean(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  bookingAlerts: z.boolean(),
  maintenanceAlerts: z.boolean(),
  paymentAlerts: z.boolean(),
  checkInReminders: z.boolean(),
  checkOutReminders: z.boolean(),
});

type HotelSettingsData = z.infer<typeof hotelSettingsSchema>;
type IntegrationSettingsData = z.infer<typeof integrationSettingsSchema>;
type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<HotelSetting[]>({
    queryKey: ["/api/settings"],
  });

  const { data: syncStatus } = useQuery({
    queryKey: ["/api/cloudbeds/sync-status"],
  });

  const hotelForm = useForm<HotelSettingsData>({
    resolver: zodResolver(hotelSettingsSchema),
    defaultValues: {
      hotelName: "Sydney Harbor Hotel",
      address: "123 Circular Quay, Sydney NSW 2000, Australia",
      phone: "+61 2 9999 0000",
      email: "info@sydneyharborhotel.com",
      website: "https://sydneyharborhotel.com",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      currency: "AUD",
      timezone: "Australia/Sydney",
      defaultRoomRate: "285.00",
      taxRate: "10.00",
    },
  });

  const integrationForm = useForm<IntegrationSettingsData>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      cloudbedsEnabled: true,
      stripeEnabled: true,
      twilioEnabled: false,
      emailEnabled: true,
    },
  });

  const notificationForm = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingAlerts: true,
      maintenanceAlerts: true,
      paymentAlerts: true,
      checkInReminders: true,
      checkOutReminders: true,
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => 
      apiRequest("PUT", `/api/settings/${key}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update settings",
        variant: "destructive" 
      });
    },
  });

  const syncCloudbedsData = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cloudbeds/sync"),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cloudbeds/sync-status"] });
      toast({ 
        title: "Sync Complete", 
        description: `Synced ${data.syncedItems.rooms} rooms, ${data.syncedItems.bookings} bookings, ${data.syncedItems.rates} rates` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Sync Failed", 
        description: error.message || "Failed to sync with Cloudbeds",
        variant: "destructive" 
      });
    },
  });

  const handleHotelSettingsSubmit = (data: HotelSettingsData) => {
    Object.entries(data).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key: `hotel_${key}`, value });
    });
  };

  const handleIntegrationSettingsSubmit = (data: IntegrationSettingsData) => {
    Object.entries(data).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key: `integration_${key}`, value });
    });
  };

  const handleNotificationSettingsSubmit = (data: NotificationSettingsData) => {
    Object.entries(data).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key: `notification_${key}`, value });
    });
  };

  const handleCloudbedsSync = () => {
    setIsSyncing(true);
    syncCloudbedsData.mutate(undefined, {
      onSettled: () => setIsSyncing(false)
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-hotel-blue" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure hotel management system preferences</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {syncStatus && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-available rounded-full"></div>
              <span className="text-gray-600">Last sync:</span>
              <span className="text-gray-900">{new Date(syncStatus.lastSync).toLocaleTimeString()}</span>
            </div>
          )}
          
          <Button
            onClick={handleCloudbedsSync}
            disabled={isSyncing}
            variant="outline"
            data-testid="button-sync-cloudbeds"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Cloudbeds
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" data-testid="tab-general">
            <Hotel className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            <Globe className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...hotelForm}>
                <form onSubmit={hotelForm.handleSubmit(handleHotelSettingsSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={hotelForm.control}
                      name="hotelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-hotel-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-hotel-phone" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={hotelForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-hotel-address" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={hotelForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-hotel-email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-hotel-website" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={hotelForm.control}
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-checkin-time" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} data-testid="input-checkout-time" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger data-testid="select-currency">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger data-testid="select-timezone">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                                <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                                <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                                <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={hotelForm.control}
                      name="defaultRoomRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Room Rate (AUD)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-default-rate" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={hotelForm.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-tax-rate" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="bg-hotel-blue hover:bg-hotel-blue/90" data-testid="button-save-general">
                    <Save className="w-4 h-4 mr-2" />
                    Save General Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cloudbeds Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-hotel-blue" />
                  <span>Cloudbeds PMS</span>
                  <Badge className="bg-hotel-green text-white">Connected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Property Management System</p>
                    <p className="text-sm text-gray-600">Real-time room availability and booking sync</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-cloudbeds" />
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-hotel-green" />
                    <span className="text-sm font-medium text-green-800">Connected and syncing</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Last sync: {syncStatus ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
                  </p>
                </div>

                <Button 
                  onClick={handleCloudbedsSync}
                  disabled={isSyncing}
                  variant="outline" 
                  className="w-full"
                  data-testid="button-manual-sync"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Manual Sync
                </Button>
              </CardContent>
            </Card>

            {/* Stripe Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-hotel-blue" />
                  <span>Stripe Payments</span>
                  <Badge className="bg-hotel-green text-white">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Processing</p>
                    <p className="text-sm text-gray-600">Secure credit card and digital payments</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-stripe" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Supported Methods:</span>
                    <div className="flex space-x-2">
                      <Badge variant="outline">Visa</Badge>
                      <Badge variant="outline">Mastercard</Badge>
                      <Badge variant="outline">Apple Pay</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="font-medium">2.9% + 30¢</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-stripe-settings">
                  Configure Stripe
                </Button>
              </CardContent>
            </Card>

            {/* Email Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-hotel-blue" />
                  <span>Email Service</span>
                  <Badge className="bg-hotel-green text-white">Configured</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMTP Email Service</p>
                    <p className="text-sm text-gray-600">Automated guest communications</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-email" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">Gmail SMTP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">From Address:</span>
                    <span className="font-medium">noreply@sydneyharborhotel.com</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-email-settings">
                  Email Settings
                </Button>
              </CardContent>
            </Card>

            {/* SMS Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-hotel-blue" />
                  <span>SMS Service</span>
                  <Badge variant="secondary">Optional</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Twilio SMS Service</p>
                    <p className="text-sm text-gray-600">Guest notifications and confirmations</p>
                  </div>
                  <Switch data-testid="switch-sms" />
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Setup Required</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Configure Twilio credentials to enable SMS notifications
                  </p>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-sms-setup">
                  Setup SMS Service
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(handleNotificationSettingsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Communication Channels</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>Email Notifications</FormLabel>
                              <FormDescription>Receive alerts via email</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-email-notifications" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>SMS Notifications</FormLabel>
                              <FormDescription>Receive alerts via SMS</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-sms-notifications" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>Push Notifications</FormLabel>
                              <FormDescription>Browser notifications</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-push-notifications" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Alert Types</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="bookingAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>Booking Alerts</FormLabel>
                              <FormDescription>New reservations and cancellations</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-booking-alerts" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="maintenanceAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>Maintenance Alerts</FormLabel>
                              <FormDescription>Room maintenance requests</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-maintenance-alerts" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="paymentAlerts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>Payment Alerts</FormLabel>
                              <FormDescription>Payment confirmations and failures</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-payment-alerts" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="checkInReminders"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <FormLabel>Check-in Reminders</FormLabel>
                              <FormDescription>Guest arrival notifications</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-checkin-reminders" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-hotel-blue hover:bg-hotel-blue/90" data-testid="button-save-notifications">
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-hotel-blue" />
                  <span>Access Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Extra security for admin accounts</p>
                    </div>
                    <Switch data-testid="switch-2fa" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-24" data-testid="select-session-timeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Login Attempts</p>
                      <p className="text-sm text-gray-600">Max failed login attempts</p>
                    </div>
                    <Select defaultValue="5">
                      <SelectTrigger className="w-16" data-testid="select-login-attempts">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-hotel-blue" />
                  <span>User Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Hotel Manager</span>
                      <Badge className="bg-hotel-red text-white">Full Access</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Complete system access and configuration</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Front Desk Staff</span>
                      <Badge className="bg-hotel-blue text-white">Limited</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Bookings, check-in/out, guest management</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Housekeeping</span>
                      <Badge className="bg-hotel-green text-white">Basic</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Room status updates and maintenance requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
