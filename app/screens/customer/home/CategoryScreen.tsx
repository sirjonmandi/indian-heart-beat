// ===============================================
// UPDATED CATEGORY SCREEN - SHOWS ALL CATEGORIES
// ===============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Constants } from '../../../utils/constants';
import CustomerHeader from '../../../components/customer/CustomerHeader';
import CategoryGrid, { Category } from '../../../components/customer/CategoryGrid';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api';
import { Colors } from '@/styles/colors';
interface RouteParams {
  categories?: {
    id: number;
    name: string;
    icon: string;
    color: string;
    image?: string;
  };
  store?:{
    id:number;
    name:string;
    ratings:string;
    location?:string;
    shop_images?:string[];
    distance?:number;
  };
  location?:string;
  addresses:any;
}
const CategoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const route = useRoute();
  const { categories, store, location, addresses } = (route.params as RouteParams) || {} ;
  // console.log('params response '+ JSON.stringify(route.params));

  const handleCategoryPress = (category: Category) => {
    navigation.navigate(Constants.SCREENS.PRODUCT_LIST, { store, category });
  };

  const handleSearchPress = () => {
    navigation.navigate(Constants.SCREENS.SEARCH);
  };

  const handleProfilePress = () => {
    navigation.navigate(Constants.SCREENS.PROFILE);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddressPress =()=>{
    setModalVisible(true)
  };

  const setDefaultAddress = async(id:string)=>{
      try {
        const res:ApiResponse = await customerAPI.setDefaultAddress(id);
        const { success,message } = res.data;
        if (success) {
          Alert.alert('Success',message);
        }
      } catch (error:any) {
        const apiMessage =
          error?.response?.data?.errors &&
          Object.values(error.response.data.errors)?.[0]?.[0] ||
          error?.response?.data?.message ||
          error?.message || 'Something went wrong. Please try again.';
        console.error('Address save error response ' + apiMessage);
      }
  }

  const handleSelect = (Item) => {
    if (!setDefaultAddress(String(Item.id))) return;
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomerHeader
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
        onAddressPress={handleAddressPress}
        location={location}
        showBack={true}
        onBackPress={handleBackPress}
      />
      
      <CategoryGrid
        categories={categories}
        onCategoryPress={handleCategoryPress}
        numColumns={3}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.title}>Set Default Address</Text>
              { addresses && addresses.length > 0 ?
                (<FlatList
                  data={addresses}
                  keyExtractor={(item) => item.id.toString()}
                  ItemSeparatorComponent={() => <View  style={{ height: 10, marginHorizontal: 16}}/>}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.addressCard,
                        item.isDefault && { backgroundColor: '#ffffff', borderColor: item.isDefault ? '#4CAF50' : '#e0e0e0' },
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <View>
                            {/* Address Header */}
                            <View style={styles.addressHeader}>
                              <View style={styles.addressTypeContainer}>
                                <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                                  <Icon
                                    name={item.type === 'home' ? 'home' : (item.type === 'office' ? 'work' : 'location-on')}
                                    size={24}
                                    color={'#4CAF50'}
                                  />
                                </View>
                                <View style={styles.typeAndBadge}>
                                  <Text style={[styles.addressType, { color:'#2c2c2c'}]}>
                                    {item.type?.toUpperCase()}
                                  </Text>
                                  {item.isDefault === 1 && (
                                    <View style={[styles.defaultBadge, { backgroundColor: '#4CAF50' }]}>
                                      <Icon name="star" size={14} color="#fff" />
                                      <Text style={styles.defaultText}>Default</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                      
                            {/* Address Details */}
                            <View style={styles.addressDetails}>
                              {(item.phone && item.name) && (
                                <View style={styles.phoneContainer}>
                                  <Text style={[styles.addressName, { color: '#2c2c2c', marginRight:10 }]} numberOfLines={1}>
                                    {item.name}
                                  </Text>
                                  <Icon name="phone" size={16} color={'#666666'} />
                                  <Text style={[styles.addressPhone, { color: '#666666' }]}>
                                    {item.phone}
                                  </Text>
                                </View>
                              )}
                              <Text style={[styles.addressText, { color: '#666666' }]} numberOfLines={3}>
                                {`${item.addressLine1} ${item.addressLine2 } ${item.city } ${item.state } ${item.pincode }`}
                              </Text>
                            </View>
                          </View>
                    </TouchableOpacity>
                  )}
                />)
                :
                (
                  <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: '#666666' + '20' }]}>
                      <Icon name="location-off" size={60} color={'#666666'} />
                    </View>
                    <Text style={[styles.emptyTitle, { color:'#2c2c2c' }]}>No Addresses Found</Text>
                    <Text style={[styles.emptySubtitle, { color: '#666666' }]}>
                      Add your first delivery address to get started
                    </Text>
                    <TouchableOpacity
                      style={[styles.addFirstAddressButton, { backgroundColor: '#FFA500' }]}
                      onPress={() => navigation.navigate(Constants.SCREENS.ADD_ADDRESS)}
                    >
                      <Icon name="add" size={20} color="#fff" />
                      <Text style={styles.addFirstAddressText}>Add Address</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#F5F5F5',
  // },
  addAddressButton:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
    },
    addAddressText:{
      fontSize: 18,
      fontWeight: 'bold',
      color: Colors.textSecondary,
    },
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalBox: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 20 , minHeight:400,},
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color:'#000'},
  
  
    addressHeader: {
      marginBottom: 10,
    },
    addressCard: {
      borderRadius: 16,
      padding: 10,
      borderWidth: 1,
      // elevation: 2,
      borderColor:'#e0e0e0',
      // shadowColor: '#666666',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    addressTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    typeAndBadge: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    addressType: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    defaultBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    defaultText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    addressDetails: {
      marginBottom: 20,
    },
    addressName: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
    },
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // marginBottom: 8,
    },
    addressPhone: {
      fontSize: 14,
      marginLeft: 8,
    },
    addressText: {
      fontSize: 14,
      lineHeight: 20,
    },
  
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    addFirstAddressButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 25,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    addFirstAddressText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
});

export default CategoryScreen;