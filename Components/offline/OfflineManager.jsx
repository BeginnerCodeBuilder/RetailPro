import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

// Local Storage Manager
class LocalDataManager {
  static setItem(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        synced: false
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static getPendingSync() {
    const keys = Object.keys(localStorage);
    const pending = [];

    keys.forEach(key => {
      if (key.startsWith('pending_')) {
        const item = this.getItem(key);
        if (item && !item.synced) {
          pending.push({ key, ...item });
        }
      }
    });

    return pending;
  }

  static markSynced(key) {
    const item = this.getItem(key);
    if (item) {
      item.synced = true;
      localStorage.setItem(key, JSON.stringify(item));
    }
  }
}

// Offline Queue Manager
class OfflineQueue {
  static queue = [];

  static add(action, data, priority = 1) {
    const queueItem = {
      id: Date.now() + Math.random(),
      action,
      data,
      priority,
      timestamp: Date.now(),
      attempts: 0
    };

    this.queue.push(queueItem);
    this.sortByPriority();
    this.saveToStorage();

    return queueItem.id;
  }

  static sortByPriority() {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  static saveToStorage() {
    LocalDataManager.setItem('offline_queue', this.queue);
  }

  static loadFromStorage() {
    const stored = LocalDataManager.getItem('offline_queue');
    if (stored && stored.data) {
      this.queue = stored.data;
    }
  }

  static async processQueue() {
    if (this.queue.length === 0) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;
    const processedItems = [];

    for (const item of this.queue) {
      try {
        await this.executeAction(item);
        processedItems.push(item.id);
        success++;
      } catch (error) {
        item.attempts++;
        if (item.attempts >= 3) {
          processedItems.push(item.id);
          failed++;
        }
      }
    }

    // Remove processed items
    this.queue = this.queue.filter(item => !processedItems.includes(item.id));
    this.saveToStorage();

    return { success, failed };
  }

  static async executeAction(item) {
    const { action, data } = item;

    switch (action) {
      case 'CREATE_ORDER':
        // Execute order creation
        break;
      case 'UPDATE_PRODUCT':
        // Execute product update
        break;
      case 'CREATE_CUSTOMER':
        // Execute customer creation
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Load offline queue on startup
    OfflineQueue.loadFromStorage();

    // Check for pending sync items
    const pending = LocalDataManager.getPendingSync();
    setPendingSync(pending);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming online
      setTimeout(() => {
        handleSync();
      }, 1000);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (action, data, priority = 1) => {
    const id = OfflineQueue.add(action, data, priority);

    // Update UI state
    const pending = LocalDataManager.getPendingSync();
    setPendingSync(pending);

    return id;
  };

  const handleSync = async () => {
    if (!isOnline) return;

    setSyncStatus('syncing');

    try {
      const result = await OfflineQueue.processQueue();

      // Update pending sync items
      const pending = LocalDataManager.getPendingSync();
      setPendingSync(pending);

      setSyncStatus('success');
      setLastSync(new Date());

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);

      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');

      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    }
  };

  const value = {
    isOnline,
    pendingSync: pendingSync.length,
    syncStatus,
    lastSync,
    addToQueue,
    handleSync,
    LocalDataManager,
    OfflineQueue
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
      <OfflineStatusIndicator />
    </OfflineContext.Provider>
  );
}

function OfflineStatusIndicator() {
  const { isOnline, pendingSync, syncStatus, handleSync } = useOffline();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {(!isOnline || pendingSync > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="space-y-2"
          >
            {/* Main Status Card */}
            <Card
              className={`glassmorphic border cursor-pointer transition-all duration-300 ${
                isOnline 
                  ? 'border-yellow-500/30 bg-yellow-500/10' 
                  : 'border-red-500/30 bg-red-500/10'
              }`}
              onClick={() => setShowDetails(!showDetails)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-400" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${
                      isOnline ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {isOnline ? 'Limited Connectivity' : 'Offline Mode'}
                    </p>

                    {pendingSync > 0 && (
                      <p className="text-xs text-gray-300">
                        {pendingSync} items pending sync
                      </p>
                    )}
                  </div>

                  {syncStatus === 'syncing' && (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  )}

                  {syncStatus === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}

                  {syncStatus === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Details Panel */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="glassmorphic border border-white/10 bg-slate-900/80">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          Connection Status
                        </span>
                        <Badge
                          variant="outline"
                          className={isOnline
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>

                      {pendingSync > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">
                            Pending Items
                          </span>
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            {pendingSync}
                          </Badge>
                        </div>
                      )}

                      {isOnline && pendingSync > 0 && (
                        <Button
                          onClick={handleSync}
                          disabled={syncStatus === 'syncing'}
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {syncStatus === 'syncing' ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Sync Now
                            </>
                          )}
                        </Button>
                      )}

                      {!isOnline && (
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>• All changes saved locally</p>
                          <p>• Data will sync when online</p>
                          <p>• POS functions normally</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}