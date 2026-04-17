// ===============================================
// PRODUCT INFO SECTION COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface ProductInfoSectionProps {
  name: string;
  brand: string;
  volume: string;
  servingSize:string;
  volume_unit: string;
  alcoholContent: string;
  rating?: number;
  reviewCount?: number;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  name,
  brand,
  volume,
  servingSize,
  volume_unit,
  alcoholContent,
  rating = 4.2,
  reviewCount = 128
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productBrand}>{brand}</Text>
      <Text style={styles.productDetails}>{volume} { servingSize ? `| Serving Size ${servingSize}` :''}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    marginTop:16,
    margin:8,
    borderRadius:8,
    padding: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
    lineHeight: 24,
  },
  productBrand: {
    fontSize: 14,
    color: Colors.black,
    marginBottom: 8,
  },
  productDetails: {
    fontSize: 12,
    color: Colors.black,
  },
});

export default ProductInfoSection;