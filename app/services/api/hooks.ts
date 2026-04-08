import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI, deliveryAPI, shopAPI } from './index';

// Customer Hooks
export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => customerAPI.getProducts(params),
    select: (data) => data.data,
  });
};

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => customerAPI.getCart(),
    select: (data) => data.data,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ product_id, shop_id, quantity, notes }: any) =>
      customerAPI.addToCart(product_id, shop_id, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Delivery Hooks
export const useDeliveryDashboard = () => {
  return useQuery({
    queryKey: ['delivery', 'dashboard'],
    queryFn: () => deliveryAPI.getDashboardData(),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useAvailableOrders = () => {
  return useQuery({
    queryKey: ['delivery', 'available-orders'],
    queryFn: () => deliveryAPI.getAvailableOrders(),
    select: (data) => data.data,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (order_id: string) => deliveryAPI.acceptOrder(order_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
    },
  });
};

// Shop Hooks
export const useShopDashboard = () => {
  return useQuery({
    queryKey: ['shop', 'dashboard'],
    queryFn: () => shopAPI.getDashboardData(),
    select: (data) => data.data,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useShopOrders = (status?: string) => {
  return useQuery({
    queryKey: ['shop', 'orders', status],
    queryFn: () => shopAPI.getOrders({ status }),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: ['shop', 'inventory'],
    queryFn: () => shopAPI.getInventory(),
    select: (data) => data.data,
  });
};
