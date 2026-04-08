// ===============================================
// PRODUCT HEADER COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';

interface ProductHeaderProps {
  title: string;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onBackPress: () => void;
  onProfilePress?: () => void;
  showSearch?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  title,
  searchText,
  onSearchTextChange,
  onBackPress,
  onProfilePress,
  showSearch = true
}) => {
  return (
    <LinearGradient
      colors={[Colors.background, Colors.background]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={20} color={Colors.textColor} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            {/* <Text style={styles.deliveryText}>Earliest in 30 MINS</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>Home - house no 01</Text>
              <Icon name="keyboard-arrow-down" size={16} color="#333" />
            </View> */}
            <Image
              source={require('../../../assets/images/app_logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <Icon name="person" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Name or Brand"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={onSearchTextChange}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
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
  profileButton: {
    backgroundColor: '#2C2C2C',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
});

export default ProductHeader;