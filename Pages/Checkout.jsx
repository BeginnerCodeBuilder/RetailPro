import React, { useState, useEffect } from "react";
import { Product, Customer, Sale } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingCart,
  User,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProductGrid from "../Components/checkout/ProductGrid";
import CartSidebar from "../Components/checkout/CartSidebar";
import PaymentModal from "../Components/checkout/PaymentModal";
import CustomerSelector from "../Components/checkout/CustomerSelector";

export default function Checkout() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, customersData] = await Promise.all([
        Product.filter({ is_active: true }),
        Customer.list()
      ]);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) return;

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) return prev;
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        ...product,
        quantity: 1,
        total: product.price,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price
      }];
    });
  };

  const updateCartItem = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const product = products.find(p => p.id === productId);
          if (newQuantity > product.stock_quantity) return item;
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getCartTax = () => {
    return getCartSubtotal() * 0.1; // 10% tax
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getCartTax();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.is_active;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const handleCompleteSale = async (paymentData) => {
    try {
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total
        })),
        subtotal: getCartSubtotal(),
        tax_amount: getCartTax(),
        total_amount: getCartTotal(),
        payment_method: paymentData.method,
        receipt_number: `R${Date.now()}`,
        notes: paymentData.notes || ""
      };

      await Sale.create(saleData);

      // Update stock quantities
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        await Product.update(item.id, {
          stock_quantity: product.stock_quantity - item.quantity
        });
      }

      // Update customer stats if customer selected
      if (selectedCustomer) {
        await Customer.update(selectedCustomer.id, {
          total_spent: (selectedCustomer.total_spent || 0) + getCartTotal(),
          visits_count: (selectedCustomer.visits_count || 0) + 1,
          loyalty_points: (selectedCustomer.loyalty_points || 0) + Math.floor(getCartTotal())
        });
      }

      clearCart();
      setShowPayment(false);
      loadData(); // Refresh product stock

    } catch (error) {
      console.error("Error completing sale:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Checkout</h1>
                <p className="text-slate-600 mt-1">Add products to cart and process sale</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <CustomerSelector
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={setSelectedCustomer}
                />
                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur border-slate-200/50"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  size="sm"
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                    className="capitalize"
                  >
                    {category.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <ProductGrid
            products={filteredProducts}
            onAddToCart={addToCart}
            isLoading={isLoading}
          />
        </div>

        {/* Cart Sidebar */}
        <CartSidebar
          cart={cart}
          onUpdateQuantity={updateCartItem}
          onRemoveItem={removeFromCart}
          subtotal={getCartSubtotal()}
          tax={getCartTax()}
          total={getCartTotal()}
          onCheckout={() => setShowPayment(true)}
          selectedCustomer={selectedCustomer}
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          total={getCartTotal()}
          onComplete={handleCompleteSale}
          cart={cart}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
}