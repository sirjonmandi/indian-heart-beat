// ===============================================
// SIZE SELECTOR SECTION COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface SizeOption {
  id: string;
  volume: string;
  price: number;
}

interface SizeSelectorSectionProps {
  sizes: SizeOption[];
  selectedSize?: SizeOption;
  onSizeSelect: (size: SizeOption) => void;
  onAddToCart: (size: SizeOption) => void;
}

const SizeSelectorSection: React.FC<SizeSelectorSectionProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  onAddToCart
}) => {
  return (
    <View style={styles.container}>
      {sizes.map((size,index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.sizeOption,
            selectedSize?.variant_id === size.variant_id && styles.sizeOptionSelected
          ]}
          onPress={() => onSizeSelect(size)}
        >
          <View style={styles.sizeInfo}>
            <Text style={[
              styles.sizeVolume,
              selectedSize?.variant_id === size.variant_id && styles.sizeVolumeSelected
            ]}>
              {size.volume}
            </Text>
            <Text style={[
              styles.sizePrice,
              selectedSize?.variant_id === size.variant_id && styles.sizePriceSelected
            ]}>
              ₹ {size.price}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, selectedSize?.variant_id === size.variant_id && styles.addButtonSelected]}
            onPress={() => onAddToCart(size)}
          >
            <Text style={[styles.addButtonText, selectedSize?.variant_id === size.variant_id && styles.addButtonTextSelected]}>ADD TO CART</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    margin:8,
    borderRadius:8,
  },
  sizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  sizeOptionSelected: {
    borderColor: '#4CAF50',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    backgroundColor: Colors.backgroundSecondary,
  },
  sizeInfo: {
    flex: 1,
  },
  sizeVolume: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  sizeVolumeSelected: {
    color: '#4CAF50',
  },
  sizePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.black,
  },
  sizePriceSelected: {
    color: '#4CAF50',
  },
  addButton: {
    borderColor: '#4CAF50',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  addButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButtonTextSelected: {
    color: '#FFFFFF',
  },
});

export default SizeSelectorSection;