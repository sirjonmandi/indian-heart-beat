import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '@/styles/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
interface Category {
  image: any;
  label: string;
  onpress: () => void;
}
const CategoryCircle = ({ image, label, onpress }: Category) => {
  return (
    <TouchableOpacity onPress={onpress}>
        <View style={styles.categoryItem}>
          <View style={styles.categoryCircle}>
            {image ? (
              <Image source={{ uri: image }} style={{ width: 50, height: 50, borderRadius:50, }} />
            ) : (
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name='ramen-dining' size={24} color={BG} />
              </View>
            )}
            <Text style={styles.categoryLabel}>{label}</Text>
          </View>
        </View>
    </TouchableOpacity>
  )
}
const ORANGE = Colors.primaryBg;
const BG = '#FFFFFF';
const WHITE = '#f7f6f9ff';
const DARK = Colors.black;
const GRAY = '#888888';
const styles = StyleSheet.create({
  // ── Categories
  categoriesRow: {
    marginBottom: 24,
    flexGrow: 0,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 18,
  },
  categoryCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 100,
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 14,
    color: DARK,
    fontWeight: '600',
    textAlign: 'center',
    paddingLeft: 16,
    paddingRight: 24,
  },
});

export default CategoryCircle