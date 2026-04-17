import { Colors } from '@/styles/colors';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FoodItemModal from '@/components/common/FoodItemModal';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Constants } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import FoodCard from '@/components/customer/FoodCard';
import CategoryCircle from '@components/customer/CategoryCircle';
import { addToCart, getCart } from '@/store/slices/cartSlice';
import { useAlert } from '@/components/context/AlertContext';
import { getHomePageInfo } from '@/store/slices/customerHomeSlice';
import { NotificationRequest } from '@/components/common/NotificationRequest';
import { Category } from '@/components/customer/CategoryGrid';
// Type definitions

interface ModalItem {
  id: number;
  shop_id: number;
  variant_id: number;
  name: string;
  sku: string;
  barcode: string;
  images: string[];
  volume: number;
  variant_name: string;
  volume_unit: string;
  alcoholContent: string;
  originalPrice: string;
  price: string;
  stock_quantity: number;
  inStock: boolean;
  discount_percentage: string;
  brand: string;
  category: string;
  brand_id: number;
  category_id: number;
}

interface FoodItem {
    id: number;
    shop_id: number;
    variant_id: number;
    name: string;
    sku: string;
    barcode: string;
    images: string[];
    volume: number;
    variant_name: string;
    volume_unit: string;
    alcoholContent: string;
    originalPrice: string;
    price: string;
    stock_quantity: number;
    inStock: boolean;
    discount_percentage: string;
    brand: string;
    category: string;
    brand_id: number;
    category_id: number;
}

// ─── Placeholder image components ──────────────────────────────────────────
const SushiBanner = () => (
  <View style={styles.sushiPlaceholder}>
    <Image source={require('../../../../assets/foods/sushi.png')} style={{ width: 240, height: 240 }} />
  </View>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const {brands, categories, addresses, defaultAddress, carousel, newArrivals:products } = useSelector((state:RootState)=>state.customerHome);
  const { items: cartItems, itemsCount:totalItems, subTotal } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  // console.log('================== products ==================');
  // console.log(JSON.stringify(products, null, 2));
  // console.log('====================================');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [refresh,setRefresh] = useState(false);
  const isFocused = useIsFocused();

  const handleAddToCart = (item: ModalItem) => {
    dispatch(addToCart({
      shopId: item.shop_id,
      productId: item.id,
      variantId: item.variant_id,
      quantity: 1,
      price: item.price,
      originalPrice: item?.originalPrice,
      notes: '',
    }))
    onCloseModal();
    showAlert({
       title: 'Added to Cart',
        message: `${item.name} has been added to your cart`,
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
          }
        ],
    });
  }

  const handleFoodCardPress = (item: FoodItem) => {
    setSelectedItem(item);
    setVisible(true);
  };

  const onCloseModal = () =>{
    setVisible(false);
    setSelectedItem(null);
  }

  const getHomePageData = async() => {
    try {
      await dispatch(getHomePageInfo() as any).unwrap();
      await getProducts();
    } catch (error) {
      console.log('================= error ===================');
      console.log(error);
      console.log('====================================');
    }
  }

  const getProducts  = async() =>{
    try {
      // console.log("fetching products");
      // await dispatch(fetchProducts({category:11, shop_id: 13}) as any).unwrap();
      await dispatch(getCart() as any).unwrap();
    } catch (error) {
      console.log(error);
    }
  }

  const fetchHome = async()=>{
    try {
      await getHomePageData();
    } catch (error: any) {
      // Extract the most relevant error message
      const message =
        (error.response?.data?.errors &&
          Object.values(error.response.data.errors)?.[0]?.[0]) ||
        error.response?.data?.message ||
        error.message ||
        'Something went wrong. Please try again.';

      console.error('Home API Error:', {  
        fullError: error,
        message,
        status: error.response?.status,
      });

      showAlert({
        title: "Error",
        message: message,
        buttons:[ {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
          }]
      });
    }
  }

  useEffect(()=>{
    fetchHome();
    if (refresh) {
      setRefresh(false);
    }
  },[refresh,isFocused]);

  useEffect(() => {
    setTimeout(() => {
      NotificationRequest();
    }, 2000);
  },[]);

  const handleCategoryPress = (category: Category) => {
    let store = {
      id:13,
    };
    navigation.navigate(Constants.SCREENS.PRODUCT_LIST, { store , category });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (visible) {
        e.preventDefault();
        onCloseModal();
      }
    });

    return unsubscribe;
  }, [navigation, visible]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView 
      style={styles.scroll} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
        refreshing={refresh} 
        onRefresh={getHomePageData}
        colors={[ORANGE]} // Android
        tintColor={ORANGE} // iOS
        title="Pull to refresh" // iOS
        titleColor="#999" // iOS
        />
      }
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}><Icon name='location-pin' size={15} color={DARK}/> Location</Text>
            <TouchableOpacity style={styles.locationRow} onPress={()=>{navigation.navigate(Constants.SCREENS.ADDRESSES)}}>
              <Text style={styles.locationText}>{`${defaultAddress.type} - ${defaultAddress.addressLine1}`}</Text>
              <Icon name='expand-more' size={26} color={DARK} style={styles.chevron} />
            </TouchableOpacity>
          </View>
          <View style={styles.cartWrapper}>
            <TouchableOpacity 
            style={styles.cartBtn}
            onPress={()=>navigation.navigate(Constants.SCREENS.CART)}
            >
              <Icon name='local-mall' size={20} color={DARK} style={styles.cartIcon} />
            </TouchableOpacity>

            {totalItems>0 && <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems && totalItems>0 ? totalItems : ''}</Text>
            </View>}

          </View>
        </View>

        {/* ── Search + Filter ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name='search' size={20} color={GRAY} />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#AAAAAA"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity 
          style={styles.filterBtn}
          onPress={()=>Alert.alert('Notificaton','Functionality yet to be implemented !')}
          >
            <Text style={styles.filterText}>Filter</Text>
            <View style={{ backgroundColor:WHITE, height:45, width : 45, padding:4, borderRadius:50, marginLeft:6, alignItems:'center', justifyContent:'center' }}>
              <Icon name="tune" size={20} color={GRAY} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Promo Banner ── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoTitle}>Gonna Be a{'\n'}Good Day!</Text>
            <Text style={styles.promoSub}>Free delivery, lower fees, &{'\n'}</Text>
            <Text style={styles.promoHighlight}>10% cashback, pickup!</Text>
            <TouchableOpacity 
            style={styles.orderNowBtn}
            onPress={() => Alert.alert('Order Pressed','Functionality yet to be implemented !')}
            >
              <Text style={styles.orderNowText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoRight}>
            <SushiBanner />
          </View>
        </View>

        {/* ── Categories ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categories.map((cat, i) => (
            <CategoryCircle key={i} image={cat.image} label={cat.name} onpress={() => handleCategoryPress(cat)} />
          ))}
        </ScrollView>

        {/* ── Picks For You ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Picks For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          {products && products.map((p, i) => (
            <FoodCard key={i} FoodItem={p} wide onPress={handleFoodCardPress} />
          ))}
        </ScrollView>

        <View style={{ height: 80 }} />
      </ScrollView>

      <FoodItemModal
        visible={visible}
        onClose={onCloseModal}
        item={selectedItem || undefined}
        addToCart={(item) => {
          handleAddToCart(item);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const ORANGE = Colors.primaryBg;
const BG = '#FFFFFF';
const WHITE = '#f7f6f9ff';
const DARK = '#1A1A1A';
const GRAY = '#888888';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  locationLabel: {
    fontSize: 15,
    color: DARK,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },
  chevron: {
    fontSize: 16,
    color: DARK,
  },
  cartWrapper: {
    position: 'relative',
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: 25,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Search
  searchRow: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 20,
    marginBottom: 16,
    marginHorizontal: 14,
    borderRadius: 50,
    // gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 50,
    paddingHorizontal: 14,
    height: 48,
    // elevation: 1,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
    fontWeight: '500',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    borderRadius: 50,
    paddingLeft: 10,
    paddingRight: 2,
    height: 48,
    width: 120,
    margin:2,
  },
  filterText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 12,
  },
  filterIcon: {
    color: WHITE,
    fontSize: 16,
  },

  // ── Promo Banner
  promoBanner: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: ORANGE,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 140,
  },
  promoLeft: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: WHITE,
    lineHeight: 26,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
  },
  promoHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 14,
  },
  orderNowBtn: {
    backgroundColor: WHITE,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  orderNowText: {
    color: ORANGE,
    fontWeight: '700',
    fontSize: 13,
  },
  promoRight: {
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sushiPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sushiEmoji: {
    fontSize: 64,
  },

  // ── Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },
  seeAll: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '500',
  },
});