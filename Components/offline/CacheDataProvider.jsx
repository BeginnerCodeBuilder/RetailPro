import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Order } from '@/entities/all';
import { useOffline } from './OfflineManager';

const CachedDataContext = createContext();

export const useCachedData = () => {
  const context = useContext(CachedDataContext);
  if (!context) {
    throw new Error('useCachedData must be used within CachedDataProvider');
  }
  return context;
};

export function CachedDataProvider({ children }) {
  const { isOnline, LocalDataManager, addToQueue } = useOffline();
  const [cachedProducts, setCachedProducts] = useState([]);
  const [cachedCustomers, setCachedCustomers] = useState([]);
  const [cachedOrders, setCachedOrders] = useState([]);
  const [lastCacheUpdate, setLastCacheUpdate] = useState(null);

  // Cache keys
  const CACHE_KEYS = {
    PRODUCTS: 'cached_products',
    CUSTOMERS: 'cached_customers',
    ORDERS: 'cached_orders',
    LAST_UPDATE: 'cache_last_update'
  };

  // Load cached data on startup
  useEffect(() => {
    loadCachedData();
  }, []);

  // Auto-refresh cache when online
  useEffect(() => {
    if (isOnline) {
      refreshCache();
    }
  }, [isOnline]);

  const loadCachedData = () => {
    const products = LocalDataManager.getItem(CACHE_KEYS.PRODUCTS);
    const customers = LocalDataManager.getItem(CACHE_KEYS.CUSTOMERS);
    const orders = LocalDataManager.getItem(CACHE_KEYS.ORDERS);
    const lastUpdate = LocalDataManager.getItem(CACHE_KEYS.LAST_UPDATE);

    if (products?.data) setCachedProducts(products.data);
    if (customers?.data) setCachedCustomers(customers.data);
    if (orders?.data) setCachedOrders(orders.data);
    if (lastUpdate?.data) setLastCacheUpdate(new Date(lastUpdate.data));
  };

  const refreshCache = async () => {
    if (!isOnline) return;

    try {
      // Fetch fresh data
      const [products, customers, orders] = await Promise.all([
        Product.list(),
        Customer.list(),
        Order.list('-created_date', 50)
      ]);

      // Update cache
      LocalDataManager.setItem(CACHE_KEYS.PRODUCTS, products);
      LocalDataManager.setItem(CACHE_KEYS.CUSTOMERS, customers);
      LocalDataManager.setItem(CACHE_KEYS.ORDERS, orders);
      LocalDataManager.setItem(CACHE_KEYS.LAST_UPDATE, Date.now());

      // Update state
      setCachedProducts(products);
      setCachedCustomers(customers);
      setCachedOrders(orders);
      setLastCacheUpdate(new Date());

    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
  };

  // Optimistic product operations
  const createProduct = async (productData) => {
    // Generate temporary ID
    const tempId = `temp_${Date.now()}`;
    const newProduct = {
      ...productData,
      id: tempId,
      created_date: new Date().toISOString(),
      _isPending: true
    };

    // Update local cache immediately
    const updatedProducts = [...cachedProducts, newProduct];
    setCachedProducts(updatedProducts);
    LocalDataManager.setItem(CACHE_KEYS.PRODUCTS, updatedProducts);

    if (isOnline) {
      try {
        const savedProduct = await Product.create(productData);
        // Replace temp product with real one
        const finalProducts = updatedProducts.map(p =>
          p.id === tempId ? { ...savedProduct, _isPending: false } : p
        );
        setCachedProducts(finalProducts);
        LocalDataManager.setItem(CACHE_KEYS.PRODUCTS, finalProducts);
        return savedProduct;
      } catch (error) {
        console.error('Failed to create product:', error);
        addToQueue('CREATE_PRODUCT', productData, 2);
      }
    } else {
      addToQueue('CREATE_PRODUCT', productData, 2);
    }

    return newProduct;
  };

  const updateProduct = async (id, updates) => {
    // Update local cache immediately
    const updatedProducts = cachedProducts.map(p =>
      p.id === id
        ? { ...p, ...updates, _isPending: !isOnline }
        : p
    );
    setCachedProducts(updatedProducts);
    LocalDataManager.setItem(CACHE_KEYS.PRODUCTS, updatedProducts);

    if (isOnline) {
      try {
        const savedProduct = await Product.update(id, updates);
        // Remove pending flag
        const finalProducts = updatedProducts.map(p =>
          p.id === id ? { ...savedProduct, _isPending: false } : p
        );
        setCachedProducts(finalProducts);
        LocalDataManager.setItem(CACHE_KEYS.PRODUCTS, finalProducts);
        return savedProduct;
      } catch (error) {
        console.error('Failed to update product:', error);
        addToQueue('UPDATE_PRODUCT', { id, updates }, 2);
      }
    } else {
      addToQueue('UPDATE_PRODUCT', { id, updates }, 2);
    }
  };

  // Optimistic customer operations
  const createCustomer = async (customerData) => {
    const tempId = `temp_${Date.now()}`;
    const newCustomer = {
      ...customerData,
      id: tempId,
      customer_id: `C-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-TEMP`,
      created_date: new Date().toISOString(),
      _isPending: true
    };

    const updatedCustomers = [...cachedCustomers, newCustomer];
    setCachedCustomers(updatedCustomers);
    LocalDataManager.setItem(CACHE_KEYS.CUSTOMERS, updatedCustomers);

    if (isOnline) {
      try {
        const savedCustomer = await Customer.create(customerData);
        const finalCustomers = updatedCustomers.map(c =>
          c.id === tempId ? { ...savedCustomer, _isPending: false } : c
        );
        setCachedCustomers(finalCustomers);
        LocalDataManager.setItem(CACHE_KEYS.CUSTOMERS, finalCustomers);
        return savedCustomer;
      } catch (error) {
        addToQueue('CREATE_CUSTOMER', customerData, 2);
      }
    } else {
      addToQueue('CREATE_CUSTOMER', customerData, 2);
    }

    return newCustomer;
  };

  // Optimistic order operations
  const createOrder = async (orderData) => {
    const tempId = `temp_${Date.now()}`;
    const newOrder = {
      ...orderData,
      id: tempId,
      order_id: `O-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-TEMP`,
      created_date: new Date().toISOString(),
      _isPending: true
    };

    const updatedOrders = [newOrder, ...cachedOrders];
    setCachedOrders(updatedOrders);
    LocalDataManager.setItem(CACHE_KEYS.ORDERS, updatedOrders);

    // Update product stock locally
    if (orderData.items) {
      const updatedProducts = cachedProducts.map(product => {
        const orderItem = orderData.items.find(item => item.product_id === product.id);
        if (orderItem && orderData.status === 'Paid') {
          return {
            ...product,
            current_stock: Math.max(0, product.current_stock - orderItem.quantity),
            _isPending: !isOnline
          };
        }
        return product;
      });
      setCachedProducts(updatedProducts);
      LocalDataManager.setItem(CACHE_KEYS.PRODUCTS, updatedProducts);
    }

    if (isOnline) {
      try {
        const savedOrder = await Order.create(orderData);
        const finalOrders = updatedOrders.map(o =>
          o.id === tempId ? { ...savedOrder, _isPending: false } : o
        );
        setCachedOrders(finalOrders);
        LocalDataManager.setItem(CACHE_KEYS.ORDERS, finalOrders);
        return savedOrder;
      } catch (error) {
        addToQueue('CREATE_ORDER', orderData, 3); // High priority
      }
    } else {
      addToQueue('CREATE_ORDER', orderData, 3);
    }

    return newOrder;
  };

  const value = {
    // Cached data
    products: cachedProducts,
    customers: cachedCustomers,
    orders: cachedOrders,
    lastCacheUpdate,

    // Operations
    createProduct,
    updateProduct,
    createCustomer,
    createOrder,
    refreshCache,

    // Utilities
    isProductLowStock: (product) =>
      product.current_stock <= (product.reorder_level || 10),
    isPending: (item) => item._isPending === true
  };

  return (
    <CachedDataContext.Provider value={value}>
      {children}
    </CachedDataContext.Provider>
  );
}