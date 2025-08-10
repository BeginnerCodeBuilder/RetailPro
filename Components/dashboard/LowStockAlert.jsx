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

export default function LowStockAlert({ isLoading }) {
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
        product.current_stock <= (product.reorder_level || 10) &&
        product.status === 'active'
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
      <Card className="glassmorphic border border-white/10 shadow-xl">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
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
                    <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1 bg-white/10" />
                      <Skeleton className="h-3 w-16 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full bg-white/10" />
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
                  className="flex items-center justify-between p-3 glassmorphic rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{product.name}</p>
                      <p className="text-xs text-blue-200">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      product.current_stock === 0 
                        ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {product.current_stock} left
                  </Badge>
                </motion.div>
              ))}

              <Link to={createPageUrl("Products")} className="block">
                <Button
                  variant="outline"
                  className="w-full mt-4 glassmorphic border-white/20 text-white hover:bg-white/10"
                >
                  Manage Inventory
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 glassmorphic rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-emerald-300" />
              </div>
              <p className="text-white font-medium mb-2">All Good!</p>
              <p className="text-sm text-blue-200">No low stock alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}