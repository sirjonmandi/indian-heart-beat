// ===============================================
// ENHANCED CUSTOMER HEADER COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';

interface CustomerHeaderProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchPress: () => void;
  onProfilePress?: () => void;
  onBackPress?: () => void;
  onAddressPress?:() => void;
  location?: string;
  showBack?: boolean;
  title?: string;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  searchText,
  onSearchTextChange,
  onSearchPress,
  onProfilePress,
  onBackPress,
  onAddressPress,
  location = "house no 01, road no 5, kolkata.",
  showBack = false,
  title
}) => {
  return (
    <LinearGradient
      colors={[Colors.background, Colors.background]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Delivery Info */}
      <View style={styles.deliveryInfo}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={20} color="#999" />
          </TouchableOpacity>
        ) : (
          <>
          {/* <Icon name="flash-on" size={16} color="#333" /> */}
          </>
        )}
        
        <View style={styles.titleContainer}>
          <Image 
          source={require('../../../assets/images/app_logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
          />
          {/* {title ? (
            <Text style={styles.pageTitle}>{title}</Text>
          ) : (
            <Text style={styles.deliveryText}>Earliest in 30 MINS</Text>
          )} */}
        </View>
        
        <TouchableOpacity style={styles.locationButton} onPress={onAddressPress}>
          <Text style={styles.locationButtonText}>{location.length > 25 ? `${location.slice(0,25)}...` : location}</Text>
          <Icon name="keyboard-arrow-down" size={16} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <Icon name="person" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name or Brand"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={onSearchTextChange}
            onFocus={onSearchPress}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
    textTransform: 'capitalize',
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
    backgroundColor: Colors.backgroundSecondary,
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

export default CustomerHeader;