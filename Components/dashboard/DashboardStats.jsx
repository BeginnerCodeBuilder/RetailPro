import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Gift
} from "lucide-react";

export default function DashboardStats({ stats, isLoading }) {
  const statCards = [
    {
      title: "Today's Sales",
      value: `₱${stats.todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      bgGlow: "shadow-emerald-500/20",
      textColor: "text-emerald-300"
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      bgGlow: "shadow-blue-500/20",
      textColor: "text-blue-300"
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
      bgGlow: "shadow-purple-500/20",
      textColor: "text-purple-300"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      gradient: "from-amber-500 to-amber-600",
      bgGlow: "shadow-amber-500/20",
      textColor: "text-amber-300"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`glassmorphic border border-white/10 ${stat.bgGlow} shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-200 mb-2">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 bg-white/10" />
                  ) : (
                    <p className="text-3xl font-bold text-white mb-3">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-emerald-400 mr-2" />
                <span className="text-sm text-emerald-400 font-medium">
                  {index === 0 ? "Today's performance" : "System overview"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}