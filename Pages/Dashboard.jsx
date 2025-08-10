import React, { useState, useEffect } from "react";
import { Product, Customer, Order, RewardTransaction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Gift,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import DashboardStats from "../Components/dashboard/DashboardStats";
import RecentOrders from "../Components/dashboard/RecentOrders";
import LowStockAlert from "../Components/dashboard/LowStockAlert";
import QuickActions from "../Components/dashboard/QuickActions";

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    recentOrders: [],
    activeRewards: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [products, customers, orders, rewards] = await Promise.all([
        Product.list(),
        Customer.list(),
        Order.list('-created_date', 10),
        RewardTransaction.list('-created_date', 5)
      ]);

      // Calculate today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_date);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && order.status === 'Paid';
      });
      
      const todaySales = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      // Calculate low stock items
      const lowStock = products.filter(p => 
        p.current_stock <= (p.reorder_level || 10) && p.status === 'active'
      );

      // Calculate active rewards
      const activeRewards = rewards.filter(r => r.type === 'Earned').length;

      setStats({
        todaySales,
        totalProducts: products.length,
        totalCustomers: customers.length,
        lowStockItems: lowStock.length,
        recentOrders: orders.slice(0, 5),
        activeRewards
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Store Dashboard
              </h1>
              <p className="text-blue-200 text-lg">
                {format(new Date(), "EEEE, MMMM do, yyyy")} • Philippine Time
              </p>
            </div>
            <Link to={createPageUrl("NewOrder")}>
              <Button 
                size="lg"
                className="glassmorphic neon-glow bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start New Sale
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <DashboardStats stats={stats} isLoading={isLoading} />

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <RecentOrders orders={stats.recentOrders} isLoading={isLoading} />
              <QuickActions />
            </div>

            <div className="space-y-8">
              <LowStockAlert isLoading={isLoading} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}