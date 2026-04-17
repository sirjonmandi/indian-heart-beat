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
  Alert,
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
      colors={[Colors.backgroundSecondary, Colors.backgroundSecondary]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="keyboard-arrow-left" size={20} color={Colors.black} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.deliveryText}>{title}</Text>
            {/* <View style={styles.locationRow}>
              <Text style={styles.locationText}>Home - house no 01</Text>
              <Icon name="keyboard-arrow-down" size={16} color="#333" />
            </View> */}
            {/* <Image
              source={require('../../../assets/images/app_logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            /> */}
          </View>
          
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <Icon name="person" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {/* {showSearch && (
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
        )} */}
        {showSearch && (
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Icon name='search' size={20} color={GRAY} />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#AAAAAA"
                style={styles.searchInput}
                value={searchText}
                onChangeText={onSearchTextChange}
              />
            </View>
            <TouchableOpacity 
            style={styles.filterBtn}
            onPress={()=>Alert.alert('Notificaton','Functionality yet to be implemented !')}
            >
              <Text style={styles.filterText}>Filter</Text>
              <View style={{ backgroundColor:WHITE, height:45, width : 45, padding:4, borderRadius:50, marginLeft:6, alignItems:'center', justifyContent:'center' }}>
                <Icon name="tune" size={20} color={GRAY} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const ORANGE = Colors.primaryBg;
const BG = '#FFFFFF';
const WHITE = '#f7f6f9ff';
const DARK = '#1A1A1A';
const GRAY = '#888888';

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
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
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
    backgroundColor: '#f7f6f9ff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // searchContainer: {
  //   marginBottom: 0,
  // },
  // searchBar: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 8,
  //   paddingHorizontal: 12,
  //   paddingVertical: 12,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 2,
  //   elevation: 2,
  // },
  // searchIcon: {
  //   marginRight: 8,
  // },
  // searchInput: {
  //   flex: 1,
  //   fontSize: 14,
  //   color: '#333',
  //   padding: 0,
  // },
  // logoImage: {
  //   width: 50,
  //   height: 50,
  // },
    // ── Search
  searchRow: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 20,
    // marginBottom: 16,
    // marginHorizontal: 14,
    borderRadius: 50,
    // gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 50,
    paddingHorizontal: 14,
    height: 48,
    // elevation: 1,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
    fontWeight: '500',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    borderRadius: 50,
    paddingLeft: 10,
    paddingRight: 2,
    height: 48,
    width: 120,
    margin:2,
  },
  filterText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 12,
  },
  filterIcon: {
    color: WHITE,
    fontSize: 16,
  },
});

export default ProductHeader;