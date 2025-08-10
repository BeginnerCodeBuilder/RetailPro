import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product } from "@/entities/Product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Package, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LowStockAlerts({ isLoading }) {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    setLoading(true);
    try {
      const products = await Product.list();
      const lowStock = products.filter(product =>
        product.stock_quantity <= (product.low_stock_threshold || 10)
      ).slice(0, 5);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Error loading low stock items:", error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading || isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ) : lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      product.stock_quantity === 0 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {product.stock_quantity} left
                  </Badge>
                </motion.div>
              ))}

              <Link to={createPageUrl("Products")} className="block">
                <Button
                  variant="outline"
                  className="w-full mt-4 hover:bg-slate-100"
                >
                  Manage Inventory
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-slate-900 font-medium">All Good!</p>
              <p className="text-sm text-slate-500">No low stock alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}