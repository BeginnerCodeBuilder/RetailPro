import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Wifi,
  Database,
  Bell,
  Printer,
  Store,
  Save
} from "lucide-react";
import ExportImport from "../Components/offline/ExportImport";
import { useOffline } from "../Components/offline/OfflineManager";

export default function Settings() {
  const { isOnline, pendingSync, handleSync } = useOffline();
  const [settings, setSettings] = useState({
    businessName: 'RetailPro Store',
    businessAddress: '123 Main Street, Manila, Philippines',
    contactNumber: '09171234567',
    vatRate: 12,
    currencySymbol: '₱',
    enableNotifications: true,
    autoSync: true,
    printReceipts: true,
    lowStockThreshold: 10
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-blue-200">Configure your POS system</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="glassmorphic border border-white/10">
            <TabsTrigger value="general" className="data-[state=active]:bg-white/20">
              <Store className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="offline" className="data-[state=active]:bg-white/20">
              <Wifi className="w-4 h-4 mr-2" />
              Offline & Sync
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-white/20">
              <Database className="w-4 h-4 mr-2" />
              Backup & Restore
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="glassmorphic border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-white">Business Name</Label>
                    <Input
                      id="businessName"
                      value={settings.businessName}
                      onChange={(e) => handleSettingChange('businessName', e.target.value)}
                      className="glassmorphic border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-white">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={settings.contactNumber}
                      onChange={(e) => handleSettingChange('contactNumber', e.target.value)}
                      className="glassmorphic border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="businessAddress" className="text-white">Business Address</Label>
                    <Input
                      id="businessAddress"
                      value={settings.businessAddress}
                      onChange={(e) => handleSettingChange('businessAddress', e.target.value)}
                      className="glassmorphic border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vatRate" className="text-white">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={settings.vatRate}
                      onChange={(e) => handleSettingChange('vatRate', Number(e.target.value))}
                      className="glassmorphic border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol" className="text-white">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={(e) => handleSettingChange('currencySymbol', e.target.value)}
                      className="glassmorphic border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline">
            <div className="space-y-6">
              {/* Sync Status */}
              <Card className="glassmorphic border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Wifi className={`w-5 h-5 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Current Status</span>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      isOnline 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>

                  {pendingSync > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Pending Sync Items</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
                          {pendingSync}
                        </span>
                        {isOnline && (
                          <Button size="sm" onClick={handleSync} className="bg-blue-600 hover:bg-blue-700">
                            Sync Now
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Offline Settings */}
              <Card className="glassmorphic border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Offline Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Auto-sync when online</Label>
                      <p className="text-sm text-gray-400">Automatically sync pending changes when connection is restored</p>
                    </div>
                    <Switch
                      checked={settings.autoSync}
                      onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Low Stock Threshold</Label>
                    <Input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => handleSettingChange('lowStockThreshold', Number(e.target.value))}
                      className="glassmorphic border-white/20 text-white max-w-24"
                    />
                    <p className="text-sm text-gray-400">Alert when product stock falls below this number</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backup">
            <ExportImport />
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="glassmorphic border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable notifications</Label>
                    <p className="text-sm text-gray-400">Show system notifications and alerts</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-print receipts</Label>
                    <p className="text-sm text-gray-400">Automatically generate receipt previews after sales</p>
                  </div>
                  <Switch
                    checked={settings.printReceipts}
                    onCheckedChange={(checked) => handleSettingChange('printReceipts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}