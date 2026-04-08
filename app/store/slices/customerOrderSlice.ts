import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customerAPI } from '@/services/api/customerAPI';

interface OrderState {
    orders: any[];
    currentOrder: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
};

export const getOrders = createAsyncThunk(
    'orders/getOrders',
    async (params: {
        status?: string;
        page?: number;
    } = {}, { rejectWithValue }) => {
        try {
            const response = await customerAPI.getOrders(params);
            const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
            const data = response.data ? (response.data.data || response.data) : response;
            const message = response.message || 'Orders retrieved successfully';

            if (success) {
                return data;
            } else {
                return rejectWithValue(message || "Failed to retrieve orders");
            }

        } catch (error: any) {
            console.error('Orders fetch error:', error);

            // Handle different types of errors
            if (error?.status === 401 || error?.response?.status === 401) {
                return rejectWithValue('Authentication failed. Please login again.');
            } else if (error?.status === 403 || error?.response?.status === 403) {
                return rejectWithValue('You are not authorized to view orders.');
            } else if (error?.status === 404 || error?.response?.status === 404) {
                return rejectWithValue('No orders found.');
            } else if (error?.status >= 500 || error?.response?.status >= 500) {
                return rejectWithValue('Server error. Please try again later.');
            } else if (error?.message) {
                return rejectWithValue(error.message);
            } else if (error?.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            } else if (!error?.response && !error?.status) {
                return rejectWithValue('Network connection failed. Please check your internet connection.');
            } else {
                return rejectWithValue('Failed to load orders. Please try again.');
            }
        }
    }
);

export const getSingleOrder = createAsyncThunk(
    'orders/getSingleOrder',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await customerAPI.getOrderDetails(orderId);
            const success = response.success !== undefined ? response.success : (response.status === 200 || response.statusText === 'OK');
            const data = response.data ? (response.data.data || response.data) : response;
            const message = response.message || 'Order retrieved successfully';

            if (success) {
                return data;
            } else {
                return rejectWithValue(message || "Failed to retrieve order");
            }

        } catch (error: any) {
            console.error('Single order fetch error:', error);

            // Handle different types of errors
            if (error?.status === 401 || error?.response?.status === 401) {
                return rejectWithValue('Authentication failed. Please login again.');
            } else if (error?.status === 403 || error?.response?.status === 403) {
                return rejectWithValue('You are not authorized to view this order.');
            } else if (error?.status === 404 || error?.response?.status === 404) {
                return rejectWithValue('Order not found.');
            } else if (error?.status >= 500 || error?.response?.status >= 500) {
                return rejectWithValue('Server error. Please try again later.');
            } else if (error?.message) {
                return rejectWithValue(error.message);
            } else if (error?.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            } else if (!error?.response && !error?.status) {
                return rejectWithValue('Network connection failed. Please check your internet connection.');
            } else {
                return rejectWithValue('Failed to load order. Please try again.');
            }
        }
    }
);

// Helper function to safely extract orders from API response
const extractOrdersFromPayload = (payload: any) => {
    
    // Handle different possible response structures
    let ordersData = [];
    
    if (Array.isArray(payload)) {
        // Direct array response
        ordersData = payload;
    } else if (payload?.orders && Array.isArray(payload.orders)) {
        // Nested orders array
        ordersData = payload.orders;
    } else if (payload?.data && Array.isArray(payload.data)) {
        // Data wrapper
        ordersData = payload.data;

    } else if (payload?.results && Array.isArray(payload.results)) {
        // Results wrapper
        ordersData = payload.results;
    } else {
        // console.warn('Unexpected payload structure:', payload);
        return [];
    }

    // Transform each order to ensure proper structure
    return ordersData.map((order, index) => {
        try {
            // If order is a product object instead of order object, skip it
            if (order.product_name || (order.quantity && order.price && !order.id)) {
                console.warn('Skipping product object in orders array:', order);
                return null;
            }

            // Calculate items count from products array if needed
            let itemsCount = 0;
            if (typeof order.items === 'number') {
                itemsCount = order.items;
            } else if (Array.isArray(order.products)) {
                itemsCount = order.products.length;
            } else if (Array.isArray(order.items)) {
                itemsCount = order.items.length;
            } else if (order.item_count) {
                itemsCount = Number(order.item_count) || 0;
            }

            // Ensure all required fields exist and are properly formatted
            return {
                id: order.id || order.order_id || order._id || `order_${index}`,
                orderNumber: order.orderNumber || order.order_number || order.order_id || `ORDER_${index}`,
                status: order.status || order.order_status || 'unknown',
                items: itemsCount,
                total: Number(order.total || order.total_amount || order.grand_total || 0),
                date: order.date || order.created_at || order.order_date || new Date().toISOString(),
                deliveredAt: order.deliveredAt || order.delivered_at,
                estimatedDelivery: order.estimatedDelivery || order.estimated_delivery,
                // Keep original data for reference
                _original: order
            };
        } catch (error) {
            console.error('Error transforming order:', error, order);
            return null;
        }
    }).filter(Boolean); // Remove null entries
};

const structureCurrentOrder = (order: any) => {
    return {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        products: order.items,
        subtotal: order.sub_total ?? 0,
        deliveryFee: order.delivery_charge ?? 0.00,
        handlingFee: order.handling_charge ?? 0.00,
        packagingFee: order.packaging_charge ?? 0.00,
        coupon: order.coupon ? {
            couponName: order.coupon.title,
            discountValue: order.coupon.value,
            disccountAmount:order.discount_amount,
        } : null,
        taxAmount:order.tax_amount ?? 0.00,
        total: order.total_amount ?? 0,
        paymentMethod: order.payment_method ?? '',
        paymentStatus: order.payment_status ?? '',
        shopName:order.shop.name,
        shopAddress:order.shop.address,
        deliveryAddress: order.customer.address ? order.customer.address.contact_name + ', ' + order.customer.address.address_line_1 + ', ' + order.customer.address.pincode + ' phone: ' + order.customer.address.contact_phone : 'Address not provided',
        estimatedDelivery: order.estimated_delivery_time,
        actualDelivery: order.actual_delivery_time,
        date: order.created_at ?? new Date().toISOString(),
        phone: order.customer.phone ?? '',
        ...(order.delivery_partner ? {
            deliveryPartner: {
                name: order.delivery_partner.name,
                phone: order.delivery_partner.phone,
                avatar: order.delivery_partner.avatar,
                vehicleNumber: order.delivery_partner.vehicle_number,
            }
        } : {}),
        isScheduled:order.is_scheduled,
        scheduledAt:order.scheduled_at,
        // Keep original data for reference
        _original: order
    }
};

const ordersSlice = createSlice({
    name: 'ordersHistory',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get orders cases
            .addCase(getOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrders.fulfilled, (state, action) => {

                state.orders = extractOrdersFromPayload(action.payload);

                state.loading = false;
                state.error = null;
            })
            .addCase(getOrders.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            
            // Get single order cases
            .addCase(getSingleOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSingleOrder.fulfilled, (state, action) => {
                state.currentOrder =  structureCurrentOrder(action.payload)
                // console.log('================ get single order ====================');
                // console.log(JSON.stringify(action.payload,null,2));
                // console.log('====================================');
                state.loading = false;
                state.error = null;
            })
            .addCase(getSingleOrder.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
                state.currentOrder = null;
            });
    }
});

// Export actions
export const { clearError, clearCurrentOrder } = ordersSlice.actions;

// Export reducer
export default ordersSlice.reducer;