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
    background: isDark ? Colors.background : Colors.background,
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

  const renderAddressItem = ({ item, index }: { item: addresses; index: number }) => (
    <View style={[
      styles.addressCard,
      { backgroundColor: theme.cardBackground, borderColor: item.isDefault ? theme.success : theme.border }
    ]}>
      {/* Address Header */}
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
            <Icon
              name={getAddressIcon(item.type)}
              size={24}
              color={theme.success}
            />
          </View>
          <View style={styles.typeAndBadge}>
            <Text style={[styles.addressType, { color: theme.text }]}>
              {item.type?.toUpperCase()}
            </Text>
            {item.isDefault === 1 && (
              <View style={[styles.defaultBadge, { backgroundColor: theme.success }]}>
                <Icon name="star" size={14} color="#fff" />
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Address Details */}
      <View style={styles.addressDetails}>
        {item.name && (
          <Text style={[styles.addressName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
        )}
        {item.phone && (
          <View style={styles.phoneContainer}>
            <Icon name="phone" size={16} color={theme.textSecondary} />
            <Text style={[styles.addressPhone, { color: theme.textSecondary }]}>
              {item.phone}
            </Text>
          </View>
        )}
        <Text style={[styles.addressText, { color: theme.textSecondary }]} numberOfLines={3}>
          {`${item.addressLine1}, ${item.addressLine2 ? `${item.addressLine2}, ` : ''} ${item.city}, ${item.state} ${item.pincode}`}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.addressActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate(Constants.SCREENS.ADD_ADDRESS, { item })}
        >
          <Icon name="edit" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {!item.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, styles.defaultButton, { backgroundColor: theme.primary }]}
            onPress={() => setAsDefault(item.id)}
          >
            <Icon name="star-border" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Set Default</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteAddress(item.id)}
        >
          <Icon name="delete-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
      {/* <Header 
      title="Delivery Addresses"
      showBack
      onBackPress={() => navigation.goBack()} 
      /> */}
      <LinearGradient
        colors={[theme.background, theme.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <View style={{ width: 24 }} />
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
    color: Colors.textColor,
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
});

export default AddressScreen;