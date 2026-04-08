import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Constants } from '../../../utils/constants';
import { RootState } from '../../../store';
import { getCart,updateQuantity, removeFromCart, setOrderType, setScheduled, applyCoupon, removeCoupon } from '../../../store/slices/cartSlice';
import CartHeader from '../../../components/customer/CartHeader';
import CartItem, { CartItemData } from '../../../components/customer/CartItem';
import CouponSection from '../../../components/customer/CouponSection';
import PriceSummary from '../../../components/customer/PriceSummary';
import InfoSections from '../../../components/customer/InfoSections';
import PlaceOrderButton from '../../../components/customer/PlaceOrderButton';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@/styles/colors';
import { useAlert } from '@/components/context/AlertContext';
const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items: cartItems, subTotal, totalAmount, totalItems, discountAmount, packagingFee, deliveryFee, handlingFee, orderType, scheduled, cartConditions, couponCode } = useSelector((state: RootState) => {
    return state.cart;
  });
  const { defaultAddress } = useSelector((state: RootState) => state.customerHome);
  // console.log('====================================');
  // console.log(JSON.stringify(cartConditions,null,2));
  // console.log('====================================');
  const [deliverySlots, setDeliverySlot] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const {showAlert} = useAlert();
  useEffect(()=>{
    dispatch(getCart() as any);
    getDeliverySlot();
  },[dispatch,isFocused,scheduled])

  const getDeliverySlot = () => {
      if(scheduled){
        setDeliverySlot(scheduled.displayText);
        return 
      }
      let start = new Date();
      start.setHours(start.getHours() + 1, 0, 0, 0);
      let end = new Date(start);
      end.setHours(end.getHours() + 1);
      let time =  `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setDeliverySlot(time);
  };
  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Dispatch the cart refresh action
      await dispatch(getCart() as any);
      
      // Optional: Add a small delay for better UX
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setRefreshing(false);
    }
  };

  const cartItemsData: CartItemData[] = useMemo(() => {
    return cartItems.map(cartItem => {
      // Find product details from products state
      return {
        cartItemKey:cartItem.cartItemKey,
        id: cartItem.productId,
        variantId: cartItem.variantId,
        name: cartItem.name || 'Unknown Product',
        brand: cartItem?.brand,
        volume: cartItem.volume,
        price: cartItem.price,
        originalPrice: cartItem?.originalPrice,
        quantity: cartItem.quantity,
        category: cartItem?.category || 'category name',
        image: cartItem.image,
        variantDetails: {
          size: cartItem.size,
          color: cartItem.color,
          material: cartItem.material,
          style: cartItem.style,
        }
      };
    });
  }, [cartItems]);

  // Check if cart is empty
  const isCartEmpty = cartItemsData.length === 0;

  // Calculate price summary
  const calculateSummary = () => {
    const subtotal = subTotal || cartItemsData.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const discount = discountAmount || 0; // 5% discount
    // const packagingCharges = packagingFee || 30;
    // const liquorHandlingCharge = handlingFee || 20;
    // const deliveryCharge = deliveryFee || 50;
    const total = totalAmount;
    const totalSavings = discount;

    return {
      subtotal,
      cartConditions,
      // discount,
      // packagingCharges,
      // liquorHandlingCharge,
      // deliveryCharge,
      total,
      totalSavings,
    };
  };

  const summary = calculateSummary();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleProfilePress = () => {
    navigation.navigate(Constants.SCREENS.PROFILE);
  };

  const handleQuantityChange = (cartItemKey: string, newQuantity: number) => {
    // Also update Redux store if needed
    dispatch(updateQuantity({ cartId: cartItemKey, quantity: newQuantity }) as any);
  };

  const handleRemoveItem = (cartItemKey:string) => {
    // Alert.alert(
    //   'Remove Item',
    //   'Are you sure you want to remove this item from cart?',
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     {
    //       text: 'Remove',
    //       style: 'destructive',
    //       onPress: () => {
    //         // setCartItemsData(prevItems => prevItems.filter(item => item.id !== id));
    //         dispatch(removeFromCart({ cartId: cartItemKey }));
    //       }
    //     }
    //   ]
    // );

    showAlert({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from cart?',
      buttons:[
        {
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Remove',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: () => {
            dispatch(removeFromCart({ cartId: cartItemKey }) as any);
          }
        }
      ]
    })
  };

  const handleApplyCoupon = async (code: string) => {
    try {
       await dispatch(applyCoupon({coupon:code}) as any).unwrap();
       onRefresh();
       showAlert({
          title: 'Coupon Applied',
          message: `Coupon ${code} applied successfully!`,
          buttons:[
            {
              text: 'OK',
              color: Colors.btnColorPrimary,
              textColor: Colors.btnTextPrimary,
            }
          ]
       })
    } catch (error:any) {
      console.log('================ coupon error ====================');
      console.log(JSON.stringify(error,null,2));
      console.log('====================================');
      showAlert({
        title: 'Invalid Coupon',
        message: error,
        buttons:[
          {
            text: 'OK',
            color: Colors.btnColorPrimary,
            textColor: Colors.btnTextPrimary,
          }
        ]
      })
    }

  };

  const removeCouponMethod = async () => {
    await dispatch(removeCoupon({coupon:couponCode}) as any).unwrap().then((res:any)=>{
      onRefresh();
       showAlert({
          title: 'Coupon Removed',
          message: `Coupon ${couponCode} removed successfully!`,
          buttons:[
            {
              text: 'OK',
              color: Colors.btnColorPrimary,
              textColor: Colors.btnTextPrimary,
            }
          ]
       })
    }).catch((error:any)=>{ 
      console.log('================ remove coupon error ====================');
      console.log(JSON.stringify(error,null,2));
      console.log('====================================');
      showAlert({
        title: 'Error',
        message: error,
        buttons:[
          {
            text: 'OK',
            color: Colors.btnColorPrimary,
            textColor: Colors.btnTextPrimary,
          }
        ]
      })
    });
  }

  const handleRemoveCoupon = () => {
    showAlert({
      title: 'Remove Coupon',
      message: 'Are you sure want to remove coupon?',
      buttons:[
        {
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Yes',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: async () => {
            // setAppliedCoupon(undefined);
            // Alert.alert('Removed', 'Coupon removed successfully');
            await removeCouponMethod();
            // setTimeout(() => {
            //   showAlert({
            //     title: 'Coupon Removed',
            //     message: 'Coupon removed successfully',
            //     buttons: [
            //       {
            //         text: 'OK',
            //         color: Colors.btnColorPrimary,
            //         textColor: Colors.btnTextPrimary,
            //       }
            //     ]
            //   });
            // }, 300);
          },
        }
      ]
    })
  };

  const handlePlaceOrder = () => {
    // Alert.alert(
    //   'Proceed to Payment',
    //   `Total Amount: ₹${summary.total}`,
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     {
    //       text: 'Continue',
    //       onPress: () => {
    //         navigation.navigate(Constants.SCREENS.PAYMENT, {
    //           deliverySlot: deliverySlots,
    //         });
    //       }
    //     }
    //   ]
    // );

    showAlert({
      title: 'Proceed to Payment',
      message: `Total Amount: ₹${summary.total}`,
      buttons:[
        {
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Continue',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: () => { navigation.navigate(Constants.SCREENS.PAYMENT, { deliverySlot: deliverySlots, }); }
        }
      ]
    })

  };

  const handleStartShopping = () => {
    // Navigate to home/products screen
    navigation.navigate(Constants.SCREENS.HOME);
  };

  const handleAddressChange = () => {
      showAlert({
      title: 'Address Change',
      message: 'Are you sure, want to change address?',
      buttons:[
        {
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Continue',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: () => { navigation.navigate(Constants.SCREENS.ADDRESSES); }
        }
      ]
    })
  }

  const ChangeDeliverySlot = (newSlot:{
    id: string;
    displayText: string;
    startTime: string;
    endTime: string;
    startHour: number;
    startMinute: number;
    scheduledAt: string;
  }) => {
    console.log('Selected Delivery Slot:', newSlot);
    setDeliverySlot(newSlot.displayText);
    dispatch(setOrderType('scheduled'));
    dispatch(setScheduled(newSlot));
  };

  // Empty Cart Component
  const EmptyCartView = () => (
    <ScrollView 
      style={styles.emptyCartScrollView}
      contentContainerStyle={styles.emptyCartContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4CAF50']} // Android
          tintColor="#4CAF50" // iOS
          title="Pull to refresh" // iOS
          titleColor="#666" // iOS
        />
      }
    >
    <View style={styles.emptyCartContainer}>
      <View style={styles.emptyCartContent}>
        {/* <Text style={styles.emptyCartIcon}></Text> */}
        {/* <Icon name="shopping-cart-checkout" size={80} color="#ffffff"/>
        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
        <Text style={styles.emptyCartSubtitle}>
          Looks like you haven't added anything to your cart yet
        </Text> */}
        {/* <View
          style={{
            marginBottom: 40,
          }}
        >

          <View
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#ba181b',
              opacity: 0.3,
              transform: [{ scale: 1.3 }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#ba181b',
              opacity: 0.2,
              transform: [{ scale: 1.5 }],
            }}
          />
          

          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#ba181b',
              alignItems: 'center',
              justifyContent: 'center',
              // iOS shadow
              shadowColor: '#ba181b',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              // Android shadow
              elevation: 8,
            }}
          >
            <Icon name={'shopping-bag'} size={60} color="#fff" />
          </View>
        </View> */}
        <Icon name="shopping-bag" size={64} color={'#BDBDBD'} />
        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
        <Text style={styles.emptyCartSubtitle}>
          Looks like you haven't added anything to your cart yet
        </Text>
        <TouchableOpacity 
          style={styles.startShoppingButton}
          onPress={handleStartShopping}
        >
          <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <CartHeader
        onBackPress={handleBackPress}
        onProfilePress={handleProfilePress}
        deliveryTime={undefined}
      />
      
      {Array.isArray(cartItemsData) && cartItemsData.length > 0 ? (
        <>
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4CAF50']} // Android
                tintColor="#4CAF50" // iOS
                title="Pull to refresh" // iOS
                titleColor="#999" // iOS
              />
            }
          >
            {/* Cart Items */}
            {cartItemsData.map((item,index) => (
              <CartItem
                key={index}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
            
            {/* Coupon Section */}
            <CouponSection
              appliedCoupon={couponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />
            
            {/* Price Summary */}
            <PriceSummary summary={summary} />
            
            {/* Info Sections */}
            <InfoSections selectedAddress={defaultAddress} onChangeDeliverySlot={ChangeDeliverySlot} onChangeAddress={handleAddressChange} />
            
            {/* Space for bottom button */}
            <View style={styles.bottomSpace} />
          </ScrollView>
          
          {/* Place Order Button */}
          <PlaceOrderButton
            totalAmount={summary.total}
            onPlaceOrder={handlePlaceOrder}
          />
        </>
      ) : (
          <EmptyCartView />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    // borderTopWidth: 1,
    borderTopColor: '#999',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  bottomSpace: {
    height: 20,
  },
  // Empty cart styles
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: Colors.background,
  },
  emptyCartContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginTop:12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startShoppingButton: {
    backgroundColor: '#e5383b',
    // backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startShoppingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CartScreen;