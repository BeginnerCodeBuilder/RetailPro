import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Store,
  RefreshCw,
  Gift
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OfflineProvider } from "./Components/offline/OfflineManager";
import { CachedDataProvider } from "./components/offline/CachedDataProvider";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "New Order",
    url: createPageUrl("NewOrder"),
    icon: ShoppingCart,
  },
  {
    title: "Update Order",
    url: createPageUrl("UpdateOrder"),
    icon: RefreshCw,
  },
  {
    title: "Orders",
    url: createPageUrl("Orders"),
    icon: Receipt,
  },
  {
    title: "Products",
    url: createPageUrl("Products"),
    icon: Package,
  },
  {
    title: "Customers",
    url: createPageUrl("Customers"),
    icon: Users,
  },
  {
    title: "Rewards",
    url: createPageUrl("Rewards"),
    icon: Gift,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const currentTime = new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <OfflineProvider>
      <CachedDataProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <style>
              {`
                :root {
                  --sidebar-background: rgba(15, 23, 42, 0.95);
                  --sidebar-foreground: 248 250 252;
                  --sidebar-primary: 59 130 246;
                  --sidebar-accent: 16 185 129;
                }
                
                .glassmorphic {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(12px);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .neon-glow {
                  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                }
              `}
            </style>

            <Sidebar className="glassmorphic border-r border-blue-400/20">
              <SidebarHeader className="border-b border-blue-400/20 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center neon-glow">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-xl">RetailPro</h2>
                    <p className="text-xs text-blue-200 font-medium">Offline-Ready POS</p>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="p-3">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-blue-200 uppercase tracking-wider px-3 py-3">
                    Main Menu
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-2">
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`group relative rounded-xl transition-all duration-300 ${
                              location.pathname === item.url 
                                ? 'glassmorphic neon-glow text-white border-blue-400/50' 
                                : 'hover:glassmorphic text-blue-100 hover:text-white'
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                                location.pathname === item.url ? 'scale-110 text-blue-300' : 'group-hover:scale-105'
                              }`} />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-8">
                  <SidebarGroupLabel className="text-xs font-semibold text-blue-200 uppercase tracking-wider px-3 py-3">
                    System Status
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="px-3 py-2 space-y-3">
                      <div className="glassmorphic rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-white font-medium">Offline Ready</span>
                        </div>
                        <p className="text-xs text-blue-200">Works without internet</p>
                      </div>

                      <div className="glassmorphic rounded-lg p-3">
                        <div className="text-xs text-blue-200 mb-1">Philippine Time</div>
                        <div className="text-sm font-mono text-white">{currentTime}</div>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-blue-400/20 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">Store Manager</p>
                    <p className="text-xs text-blue-200 truncate">Offline-Ready Mode</p>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              <header className="glassmorphic border-b border-blue-400/20 px-6 py-4 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:glassmorphic p-2 rounded-xl transition-all duration-200 text-white" />
                  <h1 className="text-xl font-bold text-white">RetailPro</h1>
                </div>
              </header>

              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </CachedDataProvider>
    </OfflineProvider>
  );
}