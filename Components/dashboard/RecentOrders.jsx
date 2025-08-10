import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Clock, User, CreditCard, Banknote, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const paymentIcons = {
  Cash: Banknote,
  GCash: Smartphone,
  'Bank Transfer': CreditCard,
  'Split Payment': CreditCard
};

const statusColors = {
  Hold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Returned: "bg-red-500/20 text-red-300 border-red-500/30",
  'Partially Returned': "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Void: "bg-gray-500/20 text-gray-300 border-gray-500/30"
};

export default function RecentOrders({ orders, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glassmorphic border border-white/10 shadow-xl">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              Recent Orders
            </CardTitle>
            <Link to={createPageUrl("Orders")}>
              <Button variant="outline" size="sm" className="glassmorphic border-white/20 text-white hover:bg-white/10">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 glassmorphic rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg bg-white/10" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
                      <Skeleton className="h-3 w-32 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 bg-white/10" />
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order, index) => {
                const PaymentIcon = paymentIcons[order.payment_method] || CreditCard;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 glassmorphic rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg">
                        <PaymentIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {order.order_id || `Order #${order.id.slice(-4)}`}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-blue-200">
                          <Clock className="w-3 h-3" />
                          {format(new Date(order.created_date), "MMM d, HH:mm")}
                          <span>•</span>
                          <span>{order.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-white">
                          ₱{order.total_amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${statusColors[order.status] || statusColors.Hold}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 glassmorphic rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-blue-300" />
              </div>
              <p className="text-white font-medium mb-2">No Orders Yet</p>
              <p className="text-sm text-blue-200 mb-4">Start your first sale today</p>
              <Link to={createPageUrl("NewOrder")}>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white border-0">
                  Create Order
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}