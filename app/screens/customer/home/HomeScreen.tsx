// ===============================================
// UPDATED HOME SCREEN - USING CUSTOMER COMPONENTS
// ===============================================

import React, { useEffect, useState, useMemo, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Constants } from '../../../utils/constants';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api';
import { RootState } from '../../../store';
import { useDispatch, useSelector} from 'react-redux';
import { Colors } from '@/styles/colors';
import { useIsFocused } from '@react-navigation/native';
import { getHomePageInfo } from '@/store/slices/customerHomeSlice';

import { NotificationRequest } from '../../../components/common/NotificationRequest';
import ProductGrid from '../../../components/customer/ProductGrid';
import { Product } from '@/store/types';
import { addToCart, fetchProducts, getCart } from '@/store/slices/cartSlice';

import CartFooter from '../../../components/customer/CartFooter';

import AutoSlider from '@/components/customer/AutoSlider';

import CategoryGrid, { Category } from '../../../components/customer/CategoryGrid';
import { useAlert } from '@/components/context/AlertContext';
import ImageCarousel from '@/components/customer/ImageCarousel';


interface Store {
  id: number;
  name: string;
  rating: string;
  deliveryTime: string; 
  location: string; 
  logo: boolean;
  productImage: string | null;
  is_active?: boolean;
}

const HomeScreen: React.FC = () => {
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  // const DEFAULT_SLIDES = [
  //   {
  //     id: '1',
  //     image: { uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80' },
  //     title: 'Mountain Serenity',
  //     subtitle: 'Swiss Alps, Switzerland',
  //   },
  //   {
  //     id: '2',
  //     image: { uri: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1280&q=80' },
  //     title: 'Valley of Dreams',
  //     subtitle: 'Lauterbrunnen Valley',
  //   },
  //   {
  //     id: '3',
  //     image: { uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1280&q=80' },
  //     title: 'Into the Wild',
  //     subtitle: 'Pacific Northwest, USA',
  //   },
  //   {
  //     id: '4',
  //     image: { uri: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1280&q=80' },
  //     title: 'Golden Hour',
  //     subtitle: 'Tuscany, Italy',
  //   },
  //   {
  //     id: '5',
  //     image: { uri: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1280&q=80' },
  //     title: 'Desert Bloom',
  //     subtitle: 'Sahara, Morocco',
  //   },
  // ];

  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const {brands, categories, addresses, defaultAddress:selectedId, carousel, newArrivals:products } = useSelector((state: RootState) => state.customerHome);
  const { items: cartItems, itemsCount, subTotal } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  // console.log('================ products response ====================');
  // console.log(JSON.stringify(products,null,2));
  // console.log('====================================');
  const [modalVisible, setModalVisible] = useState(false);
  const [refresh,setRefresh] = useState(false);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [filteredProducts, setFilteredProducts] = useState([]);

  const  { showAlert }  = useAlert();

  const cartSummary = useMemo(() => {
      const itemCount = itemsCount;
      const totalAmount = subTotal;
      return { itemCount, totalAmount };
  }, [cartItems]);

  const handleViewCart = () => {
      navigation.navigate(Constants.SCREENS.CART);
  };

  const useslice = async() =>{
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
      await useslice();
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

  useEffect(() => {
    fetchHome();
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh, isFocused]);
  //add ,isFocused in dependency array to refetch data when screen is focused
  useEffect(() => {
    setTimeout(() => {
      NotificationRequest();
    }, 2000);
  },[]);

  const handleSearchPress = () => {
    navigation.navigate(Constants.SCREENS.SEARCH);
  };

  const handleProfilePress = () => {
    navigation.navigate(Constants.SCREENS.PROFILE);
  };

  const handleAddressPress =()=>{
    setModalVisible(true)
  };

  const setDefaultAddress = async(id:string)=>{
    try {
      const res:ApiResponse = await customerAPI.setDefaultAddress(id);
      const { success,message } = res.data;
      if (success) {
        // Alert.alert('Success',message);
        showAlert({
          title: "Success",
          message: message,
          buttons:[ {
              text: 'OK',
              color: Colors.btnColorPrimary,
              textColor: Colors.btnTextPrimary,
            }]
        });
      }
    } catch (error:any) {
      const apiMessage =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)?.[0]?.[0] ||
        error?.response?.data?.message ||
        error?.message || 'Something went wrong. Please try again.';
      console.error('Address save error response ' + apiMessage);
    }
  }
  const handleSelect = (Item) => {
    if (!setDefaultAddress(String(Item.id))) return;
    setRefresh(true);
    setModalVisible(false);
  };

  useEffect(()=>{
    if (products) {
      setFilteredProducts(products);
    }
  },[products]);

  

  const handleAddToCart = (product: Product) => {
    // console.log("Add to cart clicked");
    dispatch(addToCart({
      shopId: product?.shop_id,
      productId: product.id,
      variantId:product.variant_id,
      quantity: 1,
      price: product.price,
      originalPrice: product?.originalPrice,
      notes: '',
    }) as any).unwrap()
    .then(()=>{
      showAlert({
        title: "Added to Cart",
        message: `${product.name} has been added to your cart`,
        buttons:[ {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
          }]
      });
      // setAlertConfig({
      //   visible: true,
      //   title: "Added to Cart",
      //   message: `${product.name} has been added to your cart`,
      // });

    })
    .catch((error:any)=>{
      showAlert({
        title: "Error",
        message: error || error.message || 'Failed to add to cart. Please try again.',
        buttons:[ {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
          }]
      });
      // setAlertConfig({
      //   visible: true,
      //   title: "Error",
      //   message: error || error.message || 'Failed to add to cart. Please try again.',
      // });
    })
  };

  const handleProductPress = (product: Product) => {
     navigation.navigate(Constants.SCREENS.PRODUCT_DETAIL, { product });
  };

  const handleCategoryPress = (category: Category) => {
    // setAlertConfig({
    //   visible:true,
    //   title:'Alert',
    //   message:"Product Category Button is clicked !"
    // })
    let store = {
      id:13,
    };
    navigation.navigate(Constants.SCREENS.PRODUCT_LIST, { store , category });
  }

  const handleBrandPress = (brand:any) => {
    let store = {
      id:13,
    };
    navigation.navigate(Constants.SCREENS.PRODUCT_LIST, { store , brand })
  }

  return (
    <>
    <SafeAreaView style={styles.container}>
      <CustomerHeader
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
        onAddressPress={handleAddressPress}
        location={`${selectedId.type} - ${selectedId.addressLine1}`}
      />
      <ScrollView 
        refreshControl={
          <RefreshControl
          refreshing={refresh}
          onRefresh={useslice}
          colors={['#4CAF50']} // Android
          tintColor="#4CAF50" // iOS
          title="Pull to refresh" // iOS
          titleColor="#666" // iOS
          />
        }

      >
      
      {carousel && carousel.length > 0 && 
        <ImageCarousel
            data={carousel}
            loop={true}
            autoplay={true}
          />}

        {categories && categories.length > 0 && 
          <CategoryGrid
            categories={categories}
            onCategoryPress={handleCategoryPress}
            numColumns={3}
          />
        }

        {brands && brands.length > 0 && (
          <AutoSlider
            brands={brands}
            onBrandPress={handleBrandPress}
          />
        )}
        {filteredProducts && filteredProducts.length > 0 &&         
        (
          <>
            <ProductGrid
              products={filteredProducts}
              title="New Arrivals"
              onProductPress={handleProductPress}
              onAddToCart={handleAddToCart}
              refeshProduct={getProducts}
            />
          </>
        )}

      </ScrollView>


      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.title}>Set Default Address</Text>
              { addresses && addresses.length > 0 ?
                (<FlatList
                  data={addresses}
                  keyExtractor={(item) => item.id.toString()}
                  ItemSeparatorComponent={() => <View  style={{ height: 10, marginHorizontal: 16}}/>}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.addressCard,
                        item.isDefault && { borderColor: item.isDefault ? '#4CAF50' : Colors.textPrimary },
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <View>
                            {/* Address Header */}
                            <View style={styles.addressHeader}>
                              <View style={styles.addressTypeContainer}>
                                <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                                  <Icon
                                    name={item.type === 'home' ? 'home' : (item.type === 'office' ? 'work' : 'location-on')}
                                    size={24}
                                    color={'#4CAF50'}
                                  />
                                </View>
                                <View style={styles.typeAndBadge}>
                                  <Text style={[styles.addressType, { color:Colors.textWhite}]}>
                                    {item.type?.toUpperCase()}
                                  </Text>
                                  {item.isDefault === 1 && (
                                    <View style={[styles.defaultBadge, { backgroundColor: '#4CAF50' }]}>
                                      <Icon name="star" size={14} color="#fff" />
                                      <Text style={styles.defaultText}>Default</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                      
                            {/* Address Details */}
                            <View style={styles.addressDetails}>
                              {/* {item.name && (
                                <Text style={[styles.addressName, { color: '#2c2c2c' }]} numberOfLines={1}>
                                  {item.name}
                                </Text>
                              )} */}
                              {(item.phone && item.name) && (
                                <View style={styles.phoneContainer}>
                                  <Text style={[styles.addressName, { color: '#2c2c2c', marginRight:10 }]} numberOfLines={1}>
                                    {item.name}
                                  </Text>
                                  <Icon name="phone" size={16} color={'#666666'} />
                                  <Text style={[styles.addressPhone, { color: '#666666' }]}>
                                    {item.phone}
                                  </Text>
                                </View>
                              )}
                              <Text style={[styles.addressText, { color: '#666666' }]} numberOfLines={3}>
                                {`${item.addressLine1}, ${item.addressLine2 ? `${item.addressLine2}, ` : ''} ${item.city}, ${item.state} ${item.pincode}`}
                              </Text>
                            </View>
                          </View>
                    </TouchableOpacity>
                  )}
                />)
                :
                (
                  <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: '#666666' + '20' }]}>
                      <Icon name="location-off" size={60} color={'#666666'} />
                    </View>
                    <Text style={[styles.emptyTitle, { color:'#2c2c2c' }]}>No Addresses Found</Text>
                    <Text style={[styles.emptySubtitle, { color: '#666666' }]}>
                      Add your first delivery address to get started
                    </Text>
                    <TouchableOpacity
                      style={[styles.addFirstAddressButton, { backgroundColor: '#FFA500' }]}
                      onPress={() => navigation.navigate(Constants.SCREENS.ADD_ADDRESS)}
                    >
                      <Icon name="add" size={20} color="#fff" />
                      <Text style={styles.addFirstAddressText}>Add Address</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <CartFooter 
          itemCount={cartSummary.itemCount}
          totalAmount={cartSummary.totalAmount}
          onViewCart={handleViewCart}
      />
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  addAddressButton:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  addAddressText:{
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { margin: 20, backgroundColor: Colors.backgroundSecondary, borderRadius: 10, padding: 20 , minHeight:400,},
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color:Colors.textColor},

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    // color: '#ff2323',
    // color: '#333',
    margin: 10,
    borderRadius: 16,
    // marginBottom: 12,
    paddingHorizontal: 16,
  },

  addressHeader: {
    marginBottom: 10,
  },
  addressCard: {
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    // elevation: 2,
    borderColor:'#e0e0e0',
    // shadowColor: '#666666',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeAndBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressType: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressDetails: {
    marginBottom: 20,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 8,
  },
  addressPhone: {
    fontSize: 14,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addFirstAddressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  seeMoreBtn: {
    marginVertical: 20,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth:1,
    borderColor:Colors.primary,
    alignItems: 'center',
  },

  seeMoreText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen;