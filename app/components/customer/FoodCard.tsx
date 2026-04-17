import {
    View, 
    Text,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
 } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@/styles/colors';
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
interface FoodCardProps {
  FoodItem: FoodItem;
  wide?: boolean;
  onPress?: (item: FoodItem) => void;
}
const { width } = Dimensions.get('window');
const FoodCard = ({ FoodItem, wide, onPress }: FoodCardProps) => {
  return (
    <View style={[styles.foodCard, wide && { width: width * 0.7 }]}>
        <ImageBackground source={FoodItem.images && FoodItem.images.length > 0 ? { uri: FoodItem.images[0] } : require('../../../assets/images/image-not-found.png')} style={{ flex: 1 }} imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          {/* Food Image */}
          <View style={styles.foodImageContainer}>
            {/* <View style={styles.foodImagePlaceholder}>
              <Text style={styles.foodEmoji}>{FoodItem.emoji}</Text>
            </View> */}
            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <Icon name='star' size={15} color='#FFD700' />
              <Text style={styles.ratingText}>{FoodItem.discount_percentage} %</Text>
            </View>
            {/* Favourite */}
            <TouchableOpacity style={styles.favButton}>
              <Icon name='favorite-border' size={17} color='#FF4B6E' />
            </TouchableOpacity>
          </View>
    
          {/* Card Footer */}
          <View style={styles.foodCardFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{FoodItem.name}</Text>
              <View style={styles.foodMeta}>
                <Text style={styles.metaText}> {FoodItem.variant_name}</Text>
                <View style={{flexDirection: 'row', gap: 6, alignItems: 'center'}}>
                  <Text style={[styles.metaText,{ fontWeight: 'bold',color: Colors.success,fontSize: 16}]}>₹ {FoodItem.price}</Text>
                  {FoodItem.originalPrice != FoodItem.price && (
                    <Text style={[styles.metaText, { textDecorationLine: 'line-through', fontWeight:700 }]}>₹{FoodItem.originalPrice}</Text>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.arrowButton}
              onPress={() => {
                if (onPress) {
                  onPress(FoodItem);
                }
              }}
              >
              <Icon name='arrow-outward' size={16} color={WHITE} /> 
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
  )
}

const ORANGE = Colors.primaryBg;
const BG = '#FFFFFF';
const WHITE = '#f7f6f9ff';
const DARK = '#1A1A1A';
const GRAY = '#888888';
const styles = StyleSheet.create({
  // ── Food Card
  foodCard: {
    width: width * 0.65,
    backgroundColor: WHITE,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  foodImageContainer: {
    height: 170,
    position: 'relative',
  },
  foodImagePlaceholder: {
    flex: 1,
    backgroundColor: '#FFE8D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodEmoji: {
    fontSize: 72,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  favIcon: {
    fontSize: 17,
    color: '#FF4B6E',
  },
  foodCardFooter: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    height: 90,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
    marginBottom: 4,
  },
  foodMeta: {
    // flexDirection: 'row',
    // alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    color: GRAY,
  },
  metaDot: {
    fontSize: 11,
    color: GRAY,
    marginHorizontal: 3,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  arrowIcon: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FoodCard