import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertTriangle, Package } from "lucide-react";

export default function ProductGrid({ products, onAddToCart, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array(20).fill(0).map((_, i) => (
            <Card key={i} className="bg-white/80">
              <CardContent className="p-4">
                <Skeleton className="aspect-square w-full mb-3 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-16 mb-3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {products.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Products Found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}

                    {product.stock_quantity <= (product.low_stock_threshold || 10) && (
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="outline"
                          className={`${
                            product.stock_quantity === 0 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          } text-xs`}
                        >
                          {product.stock_quantity === 0 ? 'Out' : 'Low'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-900 text-sm line-clamp-2 leading-tight">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Stock: {product.stock_quantity}
                      </p>
                    </div>

                    <Button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock_quantity <= 0}
                      size="sm"
                      className={`w-full transition-all duration-300 ${
                        product.stock_quantity <= 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl group-hover:scale-105'
                      }`}
                    >
                      {product.stock_quantity <= 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}