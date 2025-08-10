import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  UserPlus,
  Package,
  BarChart3,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "New Sale",
      description: "Process customer orders",
      icon: Plus,
      href: createPageUrl("NewOrder"),
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Update Orders",
      description: "Modify pending orders",
      icon: RefreshCw,
      href: createPageUrl("UpdateOrder"),
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Add Customer",
      description: "Register new customers",
      icon: UserPlus,
      href: createPageUrl("Customers"),
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "View Reports",
      description: "Analyze performance",
      icon: BarChart3,
      href: createPageUrl("Reports"),
      gradient: "from-amber-500 to-amber-600"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glassmorphic border border-white/10 shadow-xl">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 glassmorphic rounded-lg">
              <Plus className="w-5 h-5 text-blue-300" />
            </div>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {actions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link to={action.href} className="block">
                  <div className="flex items-center justify-between p-4 glassmorphic hover:bg-white/5 rounded-xl transition-all duration-300 group border border-white/5 hover:border-white/20">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{action.title}</p>
                        <p className="text-sm text-blue-200">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}