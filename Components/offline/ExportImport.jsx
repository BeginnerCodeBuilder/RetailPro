import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Upload,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useCachedData } from './CachedDataProvider';
import { useOffline } from './OfflineManager';

export default function ExportImport() {
  const { products, customers, orders } = useCachedData();
  const { LocalDataManager } = useOffline();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);

  // Export all data as JSON backup
  const exportAllData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const backupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          products,
          customers,
          orders
        },
        localStorage: {
          // Include important localStorage items
          offline_queue: LocalDataManager.getItem('offline_queue'),
          cached_products: LocalDataManager.getItem('cached_products'),
          cached_customers: LocalDataManager.getItem('cached_customers'),
          cached_orders: LocalDataManager.getItem('cached_orders')
        }
      };

      setExportProgress(50);

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  // Export individual entity types
  const exportEntity = (entityType, data) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).filter(key => !key.startsWith('_'));
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  // Import backup data
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const backupData = JSON.parse(content);

        setImportProgress(25);

        // Validate backup format
        if (!backupData.version || !backupData.data) {
          throw new Error('Invalid backup file format');
        }

        setImportProgress(50);

        // Restore localStorage items
        if (backupData.localStorage) {
          Object.entries(backupData.localStorage).forEach(([key, value]) => {
            if (value) {
              LocalDataManager.setItem(key, value.data);
            }
          });
        }

        setImportProgress(75);

        // Note: In a real implementation, you'd want to merge/update the cached data
        // For now, we'll just store it in localStorage
        LocalDataManager.setItem('imported_backup', backupData);

        setImportProgress(100);

        setTimeout(() => {
          setIsImporting(false);
          setImportProgress(0);
          alert('Backup imported successfully. Please refresh the page to see changes.');
        }, 1000);

      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import backup: ' + error.message);
        setIsImporting(false);
        setImportProgress(0);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card className="glassmorphic border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Data Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Backup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Complete System Backup</h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={exportAllData}
                disabled={isExporting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </>
                )}
              </Button>

              <div className="flex-1">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  disabled={isImporting}
                  className="hidden"
                  id="import-backup"
                />
                <Button
                  asChild
                  disabled={isImporting}
                  variant="outline"
                  className="w-full glassmorphic border-white/20 text-white"
                >
                  <label htmlFor="import-backup" className="cursor-pointer">
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Backup
                      </>
                    )}
                  </label>
                </Button>
              </div>
            </div>

            {/* Progress bars */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Exporting data...</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Importing data...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </div>

          {/* Individual Exports */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white">Export Individual Data</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <Button
                onClick={() => exportEntity('products', products)}
                variant="outline"
                className="glassmorphic border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Products ({products.length})
              </Button>

              <Button
                onClick={() => exportEntity('customers', customers)}
                variant="outline"
                className="glassmorphic border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Customers ({customers.length})
              </Button>

              <Button
                onClick={() => exportEntity('orders', orders)}
                variant="outline"
                className="glassmorphic border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Orders ({orders.length})
              </Button>
            </div>
          </div>

          {/* Data Statistics */}
          <div className="grid gap-4 md:grid-cols-3 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{products.length}</div>
              <div className="text-sm text-gray-300">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{customers.length}</div>
              <div className="text-sm text-gray-300">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{orders.length}</div>
              <div className="text-sm text-gray-300">Orders</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}