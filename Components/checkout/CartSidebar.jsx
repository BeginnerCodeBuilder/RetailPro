import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, User } from "lucide-react";

export default function CartSidebar({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
  onCheckout,
  selectedCustomer
}) {
  return (
    <div className="w-96 bg-white/90 backdrop-blur-xl border-l border-slate-200/50 flex flex-col">
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
            <p className="text-sm text-slate-500">{cart.length} items</p>
          </div>
        </div>

        {selectedCustomer && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedCustomer.name}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Loyalty Points: {selectedCustomer.loyalty_points || 0}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Cart is Empty</h3>
              <p className="text-slate-500 text-sm">Add products to start building your order</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="bg-slate-50/50 border-slate-200/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center text-sm"
                            min="1"
                            type="number"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-bold text-slate-900">
                          ${item.total.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <div className="border-t border-slate-200/50 p-6">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-900">Total</span>
              <span className="text-slate-900">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={onCheckout}
            size="lg"
            className="w-full bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-900 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Payment
          </Button>
        </div>
      )}
    </div>
  );
}