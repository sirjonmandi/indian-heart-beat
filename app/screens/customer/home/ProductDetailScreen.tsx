// ===============================================
// UPDATED PRODUCT DETAIL SCREEN - USING REUSABLE COMPONENTS
// ===============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Constants } from '../../../utils/constants';
import { RootState } from '../../../store';
import { addToCart, getCart } from '../../../store/slices/cartSlice';
import ProductDetailHeader from '../../../components/customer/ProductDetailHeader';
import ProductImageSection from '../../../components/customer/ProductImageSection';
import ProductInfoSection from '../../../components/customer/ProductInfoSection';
import SizeSelectorSection from '../../../components/customer/SizeSelectorSection';
import InformationSection from '../../../components/customer/InformationSection';
import CartFooter from '../../../components/customer/CartFooter';
import { customerAPI } from '@/services/api/customerAPI';
import { Colors } from '@/styles/colors';
import { useAlert } from '@/components/context/AlertContext';

interface SizeOption {
  id: string;
  volume: string;
  volume_unit:string;
  price: number;
}
interface product {
    id: string;
    name: string;
    variant_id:string;
    description: string;
    brand: string;
    images:string[];
    volume: string;
    volume_unit: string;
    alcoholContent: string;
    category: string;
    shop_id:string;
}

interface RouteParams {
  product?: product;
}

const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { product } = (route.params as RouteParams) || {};

  const { items: cartItems, itemsCount, subTotal, discountAmount } = useSelector((state: RootState) => state.cart);
  
  const [selectedSize, setSelectedSize] = useState<SizeOption | undefined>();
  const [isFavorite, setIsFavorite] = useState(false);

  const [productData,setProductData] = useState<product>();

  const [sizeOptions,setSizeOptions] = useState<SizeOption[]>([]);

  const { showAlert } = useAlert();

  // Set default selected size
  React.useEffect(() => {
    fetchProductDetails(product?.id,product?.shop_id,product?.variant_id);

    // if (!selectedSize && sizeOptions.length > 0) {
    //   setSelectedSize(sizeOptions[0]);
    // }
  }, []);

    const fetchProductDetails = async(product_id:string,shop_id:string,variant_id:string) =>{
      try {
        const res = await customerAPI.getProductDetails({
          product_id,
          shop_id,
          variant_id,
        });
        setProductData(res.data.data);
        setSizeOptions(res.data.data.variants);
        setSelectedSize(res.data.data.selected_variant);
        // console.log(JSON.stringify(res.data.data,null,2));
        await dispatch( getCart() );
      } catch (error:any) {
        console.error(error + ' product_id ' + product?.id + ' shop_id ' + product?.shop_id);
      }
    }

  // Calculate cart totals
  const cartSummary = useMemo(() => {
    const itemCount = itemsCount;
    const totalAmount = subTotal;
    return { itemCount, totalAmount };
  }, [cartItems]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
  };

  const handleSizeSelect = (size: SizeOption) => {
    // setSelectedSize(size);
    fetchProductDetails(product?.id,product?.shop_id,size.variant_id);

  };

  
  const handleAddToCart = (size: SizeOption) => {
    dispatch(addToCart({
      shopId: product?.shop_id,
      productId: productData.id,
      variantId: size.variant_id,
      price: size.price,
      originalPrice: productData?.originalPrice,
      quantity: 1,
      notes: `${size.volume} variant`,
    })).unwrap()
    .then(()=>{
      //   Alert.alert(
      //   'Added to Cart',
      //   `${productData.name} (${size.volume}) has been added to your cart`,
      //   [{ text: 'OK' }]
      // );
      showAlert({
        title: 'Added to Cart',
        message: `${productData.name} (${size.volume}) has been added to your cart`,
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
          }
        ],
      });
    })
    .catch((error:any)=>{
      // Alert.alert(
      //   'Error',
      //   error || 'An error occurred while adding the product to cart. Please try again.',
      //   [{ text: 'OK' }]
      // );
      showAlert({
        title: 'Error',
        message: error || 'An error occurred while adding the product to cart. Please try again.',
        buttons:[{
          text: 'OK',
          color: '#ba181b',
          textColor: '#FFFFFF',
        }]
      })
      console.log('====================================');
      console.log(JSON.stringify(error,null,2));
      console.log('====================================');
    })
    
    // Alert.alert(
    //   'Added to Cart',
    //   `${productData.name} (${size.volume}) has been added to your cart`,
    //   [{ text: 'OK' }]
    // );
  };

  const handleViewCart = () => {
    navigation.navigate(Constants.SCREENS.CART);
  };

  return (
    <View style={styles.container}>
      <ProductDetailHeader
        onBackPress={handleBackPress}
        onFavoritePress={handleFavoritePress}
        isFavorite={isFavorite}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
       {productData && (
        <>
          <ProductImageSection
            videoUri={productData?.videos && productData.videos[0]}
            // videoUri='https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/bigbuck_bunny_8bit_2000kbps_720p_60.0fps_h264.mp4'
            productType={productData.category as any}
            images={productData.images}
          />
        
          <ProductInfoSection
            name={productData.name}
            brand={productData.brand}
            volume={productData.selected_variant.variant_name}
            servingSize={productData.servingSize}
            volume_unit={productData.volume_unit}
            alcoholContent={productData.alcoholContent}
          />
          
          <SizeSelectorSection
            sizes={sizeOptions}
            selectedSize={selectedSize}
            onSizeSelect={handleSizeSelect}
            onAddToCart={handleAddToCart}
          />
          
          <InformationSection description={productData.description} />
          
          {/* Space for cart footer */}
          <View style={styles.bottomSpace} />
        </>
       )}
      </ScrollView>
      
      <CartFooter
        itemCount={cartSummary.itemCount}
        totalAmount={cartSummary.totalAmount}
        onViewCart={handleViewCart}
      />
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
  },
  bottomSpace: {
    height: 80, // Space for cart footer
  },
  video: {
    width: '100%',
    height: 220,
  },
});

export default ProductDetailScreen;