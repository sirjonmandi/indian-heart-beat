import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Dimensions,
  RefreshControl,
} from 'react-native';
// import Header from '@/components/common/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../utils/constants';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api';
import { RootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
const { width } = Dimensions.get('window');
import { getHomePageInfo } from '@/store/slices/customerHomeSlice';
import { Colors } from '@/styles/colors';
import { useAlert } from '@/components/context/AlertContext';
interface addresses {
  id: number;
  type: string;
  name?: string;
  phone?: number;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  pincode?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  state: string;
  isDefault?: boolean;
  address?: string;
}

const AddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useAlert();
  const refresh = route.params?.refresh;
  // const [addresses, setAddresses] = useState<addresses[]>();
  const {addresses} = useSelector((state: RootState) => state.customerHome);
  // console.log('================ Addresses ====================');
  // console.log(JSON.stringify(addresses,null,2));
  // console.log('====================================');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dispatch = useDispatch();
  // Dynamic theme colors
  const theme = {
    background: isDark ? Colors.backgroundSecondary : Colors.backgroundSecondary,
    cardBackground: isDark ? Colors.backgroundSecondary : Colors.backgroundSecondary,
    text: isDark ? Colors.black : Colors.black,
    textSecondary: isDark ? '#666666' : '#666666',
    border: isDark ? Colors.backgroundSecondary : Colors.backgroundSecondary,
    shadow: isDark ? '#000000' : '#000000',
    headerGradient: isDark ? ['#FFD700', '#FFA500'] : ['#FFD700', '#FFA500'],
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#f44336',
    primary: '#FFA500',
    button:'#e5383b',
  };

  useEffect(() => {
    fetchAddresses();
    if (refresh) {
      navigation.setParams({ refresh: false });
    }
  }, [refresh]);

  const fetchAddresses = async () => {
    try {
        await dispatch(getHomePageInfo()).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteApi = async (id: number) => {
    try {
      const res: ApiResponse = await customerAPI.deleteAddress(String(id));
      const { success, message } = res.data;
      if (success) {
        // Alert.alert('Success', message);
        showAlert({
          title: 'Success',
          message: message,
          buttons:[{
            text: 'OK',
            color: Colors.btnColorPrimary,
            textColor: Colors.btnTextPrimary,
            onPress:() => fetchAddresses(),
          }]
        });
         // Refresh list after delete
      }
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)?.[0]?.[0] ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      console.error('Address delete error response ' + apiMessage);
      // Alert.alert('Error', apiMessage);
      showAlert({
        title: 'Error',
        message: apiMessage,
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }],
      })
    }
  };

  const deleteAddress = (id: number) => {
    // Alert.alert(
    //   'Delete Address',
    //   'Are you sure you want to delete this address?',
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     {
    //       text: 'Delete',
    //       style: 'destructive',
    //       onPress: () => handleDeleteApi(id),
    //     },
    //   ]
    // );

    showAlert({
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?',
      buttons:[
        {
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Delete',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: () => handleDeleteApi(id),
        }
      ]
    })
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const res: ApiResponse = await customerAPI.setDefaultAddress(id);
      const { success, message } = res.data;
      if (success) {
        // Alert.alert('Success', message);
        showAlert({
          title: 'Success',
          message: message,
          buttons:[{
            text: 'OK',
            color: Colors.btnColorPrimary,
            textColor: Colors.btnTextPrimary,
            onPress:() => fetchAddresses(),
          }]
        });
      }
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)?.[0]?.[0] ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      console.error('Address default error response ' + apiMessage);
      // Alert.alert('Error', apiMessage);
      showAlert({
        title: 'Error',
        message: apiMessage,
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }],
      })
    }
  };

  const setAsDefault = (id: number) => {
    setDefaultAddress(String(id));
  };

  const getAddressIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'home':
        return 'home';
      case 'office':
        return 'work';
      case 'other':
        return 'location-on';
      default:
        return 'place';
    }
  };

  const renderAddressItem = ({ item, index }: { item: addresses; index: number }) => {
    const isDefault = item.isDefault === 1 || item.isDefault === true;
  
    const getAddressIconName = (type: string) => {
      switch (type?.toLowerCase()) {
        case 'home':   return 'home';
        case 'office': return 'work';
        default:       return 'location-on';
      }
    };
  
    const addressLine = [
      item.addressLine1,
      item.addressLine2,
      item.city,
      item.state,
      item.pincode,
    ]
      .filter(Boolean)
      .join(', ');
  
    return (
      <View style={[cardStyles.card, isDefault && cardStyles.cardDefault]}>
        {/* Map strip — shown only for the default address */}
        {/* {isDefault && (
          <View style={cardStyles.mapStrip}>
            <View style={cardStyles.mapRingOuter} />
            <View style={cardStyles.mapRingInner} />
            <View style={cardStyles.mapDot} />
            <Text style={cardStyles.mapLabel} numberOfLines={1}>
              {item.city ?? 'Location pinned'}
            </Text>
          </View>
        )} */}
  
        {/* Card top row */}
        <View style={cardStyles.cardTop}>
          <View style={cardStyles.typeRow}>
            <View style={[cardStyles.typeIcon, isDefault && cardStyles.typeIconDefault]}>
              <Icon
                name={getAddressIconName(item.type)}
                size={18}
                color={isDefault ? '#3B6D11' : '#777'}
              />
            </View>
            <Text style={cardStyles.typeLabel}>{item.type?.toUpperCase()}</Text>
          </View>
  
          {isDefault && (
            <View style={cardStyles.defaultBadge}>
              <Icon name="star" size={11} color="#3B6D11" />
              <Text style={cardStyles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
  
        {/* Body */}
        <View style={cardStyles.cardBody}>
          {item.name && (
            <Text style={cardStyles.nameText} numberOfLines={1}>
              {item.name}
            </Text>
          )}
          {item.phone && (
            <View style={cardStyles.phoneRow}>
              <Icon name="phone" size={13} color="#aaa" />
              <Text style={cardStyles.phoneText}>{item.phone}</Text>
            </View>
          )}
          <Text style={cardStyles.addressText} numberOfLines={2}>
            {addressLine}
          </Text>
        </View>
  
        {/* Footer actions */}
        <View style={cardStyles.cardFooter}>
          {/* Edit */}
          <TouchableOpacity
            style={[cardStyles.btn, cardStyles.btnEdit]}
            onPress={() => navigation.navigate(Constants.SCREENS.ADD_ADDRESS, { item })}
            activeOpacity={0.85}
          >
            <Icon name="edit" size={13} color="#fff" />
            <Text style={cardStyles.btnEditText}>Edit</Text>
          </TouchableOpacity>
  
          {/* Set Default — hidden when already default */}
          {!isDefault && (
            <TouchableOpacity
              style={[cardStyles.btn, cardStyles.btnSetDefault]}
              onPress={() => setAsDefault(item.id)}
              activeOpacity={0.85}
            >
              <Icon name="star-border" size={13} color="#555" />
              <Text style={cardStyles.btnSetDefaultText}>Set as default</Text>
            </TouchableOpacity>
          )}
  
          {/* Delete — pushed to right */}
          <TouchableOpacity
            style={[cardStyles.btn, cardStyles.btnDelete]}
            onPress={() => deleteAddress(item.id)}
            activeOpacity={0.85}
          >
            <Icon name="delete-outline" size={16} color="#e24b4a" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.textSecondary + '20' }]}>
        <Icon name="location-off" size={60} color={theme.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Addresses Found</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Add your first delivery address to get started
      </Text>
      <TouchableOpacity
        style={[styles.addFirstAddressButton, { backgroundColor: theme.button }]}
        onPress={() => navigation.navigate(Constants.SCREENS.ADD_ADDRESS)}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.addFirstAddressText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.background, theme.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={24} color={Colors.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Delivery Addresses</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate(Constants.SCREENS.PROFILE)}>
          <Icon name="person" size={20} color={Colors.black} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      {addresses && addresses.length > 0 ? (
        <FlatList
          data={addresses}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={fetchAddresses} colors={['#4CAF50']} tintColor={theme.success} />
          }
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.addressList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Floating Add Button */}
      {addresses && addresses.length > 0 && (
        <TouchableOpacity
          style={[styles.floatingAddButton, { backgroundColor: theme.button }]}
          onPress={() => navigation.navigate(Constants.SCREENS.ADD_ADDRESS)}
        >
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
  },
  addressList: {
    padding: 16,
    paddingBottom: 100,
  },
  addressCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressHeader: {
    marginBottom: 16,
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
    marginBottom: 8,
  },
  addressPhone: {
    fontSize: 14,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  defaultButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
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
    borderRadius: 8,
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
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardDefault: {
    borderColor: '#22c55e',
  },
 
  // ── Map strip (default card only) ──
  mapStrip: {
    height: 52,
    backgroundColor: '#eaf3de',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  mapDot: {
    position: 'absolute',
    left: 24,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapRingInner: {
    position: 'absolute',
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    opacity: 0.4,
  },
  mapRingOuter: {
    position: 'absolute',
    left: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#22c55e',
    opacity: 0.2,
  },
  mapLabel: {
    fontSize: 12,
    color: '#3B6D11',
    fontWeight: '500',
    marginLeft: 56,
  },
 
  // ── Card top ──
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconDefault: {
    backgroundColor: '#eaf3de',
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eaf3de',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B6D11',
  },
 
  // ── Card body ──
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  phoneText: {
    fontSize: 13,
    color: '#888',
  },
  addressText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 19,
  },
 
  // ── Card footer / actions ──
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 5,
  },
  btnEdit: {
    backgroundColor: '#1a1a1a',
  },
  btnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  btnSetDefault: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  btnSetDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  btnDelete: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#f5f5f5',
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginLeft: 'auto',
  },
});

export default AddressScreen;