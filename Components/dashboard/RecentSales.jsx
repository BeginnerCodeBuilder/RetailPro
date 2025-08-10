
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
  cash: Banknote,
  card: CreditCard,
  mobile: Smartphone,
  loyalty_points: User
};

export default function RecentSales({ sales, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              Recent Sales
            </CardTitle>
            <Link to={createPageUrl("Reports")}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : sales.length > 0 ? (
            <div className="space-y-3">
              {sales.map((sale, index) => {
                const PaymentIcon = paymentIcons[sale.payment_method] || CreditCard;
                return (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <PaymentIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {sale.receipt_number}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-3 h-3" />
                          {format(new Date(sale.created_date), "MMM d, HH:mm")}
                          <span>•</span>
                          <span>{sale.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        ${sale.total_amount?.toFixed(2)}
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize text-xs"
                      >
                        {sale.payment_method?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-medium">No Sales Yet</p>
              <p className="text-sm text-slate-500 mb-4">Start your first sale today</p>
              <Link to={createPageUrl("Checkout")}>
                <Button size="sm">
                  Start New Sale
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
