// ===============================================
// STORE CARD COMPONENT
// ===============================================

import React, { act } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Store {
  id: number;
  name: string;
  rating: string;
  deliveryTime: string;
  location: string;
  logo: boolean;
  productImage: string | null;
  shop_images :string[];
}

interface StoreCardProps {
  store: Store;
  onPress: (store: Store) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
  const renderStoreImage = () => {
    if (Array.isArray(store.shop_images) && store.shop_images.length > 0) {
      return (
        <View style={styles.productImageContainer}>
            <View style={styles.productImagePlaceholder}>
              <Image source={{uri:store.shop_images[0]}} style={{width: 60,height: 60, borderRadius:8}} resizeMode="cover" />
            </View>
        </View>
      );
    } else {
      return (
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>BeerGo</Text>
          </View>
        </View>
      );
    }
  };
  {/* <View style={styles.productImageContainer}>
    <View style={styles.productImagePlaceholder}>
      {store.productImage === 'beer' && (
        <View style={styles.beerBottleContainer}>
          <View style={styles.beerBottle} />
          <View style={styles.beerLabel} />
        </View>
      )}
      {store.productImage === 'whiskey' && (
        <View style={styles.whiskeyContainer}>
          <View style={styles.whiskeyBottle1} />
          <View style={styles.whiskeyBottle2} />
          <View style={styles.whiskeyBottle3} />
        </View>
      )}
    </View>
  </View> */}
  
  return (
    <TouchableOpacity style={[styles.storeCard, store.is_active ? styles.activeStoreCard : styles.closeStoreCard]} onPress={() => onPress(store)} disabled={!store.is_active}>
      <View style={styles.storeImageContainer}>
        {renderStoreImage()}
      </View>

      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name} {store.is_active ? '' : '(Closed)'}</Text>
        <View style={styles.storeDetails}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={12} color="#4CAF50" />
            <Text style={styles.storeRating}>{store.rating}</Text>
          </View>
          {store.deliveryTime && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.deliveryTime}>{store.deliveryTime}</Text>
            </>
          )}
        </View>
        <Text style={styles.storeLocation}>{store.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  storeCard: {
    flexDirection: 'row',
    // backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeStoreCard: {
    backgroundColor: '#FFFFFF',
  },
  closeStoreCard: {
    backgroundColor: '#dbd9d9ff',
  },
  storeImageContainer: {
    marginRight: 12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  productImagePlaceholder: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  beerBottleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  beerBottle: {
    width: 20,
    height: 35,
    backgroundColor: '#8B4513',
    borderRadius: 3,
    marginBottom: 2,
  },
  beerLabel: {
    width: 16,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    position: 'absolute',
    bottom: 8,
  },
  whiskeyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  whiskeyBottle1: {
    width: 8,
    height: 30,
    backgroundColor: '#4A4A4A',
    borderRadius: 2,
    marginRight: 3,
  },
  whiskeyBottle2: {
    width: 8,
    height: 35,
    backgroundColor: '#2C2C2C',
    borderRadius: 2,
    marginRight: 3,
  },
  whiskeyBottle3: {
    width: 8,
    height: 25,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  storeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeRating: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 2,
  },
  separator: {
    marginHorizontal: 8,
    color: '#999',
    fontSize: 12,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  storeLocation: {
    fontSize: 12,
    color: '#666',
  },
});

export default StoreCard;