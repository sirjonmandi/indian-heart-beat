// ===============================================
// PRODUCT DETAIL HEADER COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';

interface ProductDetailHeaderProps {
  onBackPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  onBackPress,
  onFavoritePress,
  isFavorite = false
}) => {
  return (
    <LinearGradient
      colors={[Colors.backgroundSecondary, Colors.backgroundSecondary]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="keyboard-arrow-left" size={20} color={Colors.black} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            {/* <Image 
              source={require('../../../assets/images/app_logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            /> */}
            {/* <Text style={styles.deliveryText}>Earliest in 30 MINS</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>Home - house no 01</Text>
              <Icon name="keyboard-arrow-down" size={16} color="#333" />
            </View> */}
          </View>
          
          <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
            <View style={styles.favoriteIcon}>
              <Icon 
                name={isFavorite ? "favorite" : "favorite-border"} 
                size={20} 
                color={Colors.success} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
    color: '#1A1A1A',
    backgroundColor: '#f7f6f9ff',
    borderRadius: 50,
    height:40,
    width:40,
    justifyContent:'center',
    alignItems:'center',
  },
  titleContainer: {
    flex: 1,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
  },
  favoriteButton: {
    padding: 4,
    color: '#1A1A1A',
    backgroundColor: '#f7f6f9ff',
    borderRadius: 50,
    height:40,
    width:40,
    justifyContent:'center',
    alignItems:'center',
  },
  favoriteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
});

export default ProductDetailHeader;