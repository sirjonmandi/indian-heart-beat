import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../styles/colors';
import { Typography } from '../../../styles/typography';
import { Spacing } from '../../../styles/spacing';
import { GlobalStyles } from '../../../styles/globalStyles';
import { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
// import Header from '../../../components/common/Header';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api/authAPI';
import { ApiResponse } from '@/services/api';
import { ApiError } from '@/services/api';
import { Constants } from '@/utils/constants';
import { useAlert } from '@/components/context/AlertContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { showAlert } = useAlert();

  const { user } = useSelector((state: RootState) => state.auth);

  const profileOptions = [
    { id: 'ADDRESSES', title: 'My Addresses', icon: 'location-on' },
    { id: 'ORDERS_TAB', title: 'Order History', icon: 'receipt' },
    { id: 'HELP_SUPPORT', title: 'Help & Support', icon: 'help' },
    { id: 'ABOUT_US', title: 'About Us', icon: 'info' },
    // { id: 'AGE_VERIFICATION', title: 'Age Verification', icon: 'face' },
  ];

  const handleOptionPress = (optionId: string) => {
    // Navigate to respective screens
    console.log('Option pressed:', optionId);
    navigation.navigate(Constants.SCREENS[optionId])
  };

  const handleLogout = async() => {
    // Alert.alert('Logout','Are you sure you want to logout?',[
    //   { text: 'Cancel', style: 'cancel' },
    //   {
    //     text: 'Logout',
    //     style: 'destructive',
    //     onPress: async () => {
    //       {
    //         try {
    //           await new Promise((resolve, reject)=>{
    //             authAPI.logout()
    //             .then(async(res:ApiResponse)=>{
    //               await AsyncStorage.removeItem('authToken');
    //               dispatch(logout());
    //               resolve(res) 
    //             })
    //             .catch((error:ApiError)=>{
    //               console.error(error);
    //               reject(error);
    //             })
    //           })
    //         } catch (error:any) {
    //           console.error('Logout Error ' + error);
    //           Alert.alert('Logout', error);              
    //         }
    //       }
    //     },
    //   },
    // ])

    showAlert({
      title: "Logout",
      message: "Are you sure you want to logout?",
      buttons:[ 
        { 
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Logout',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: async () =>{
            await authAPI.logout()
            .then(async(res:ApiResponse)=>{
              await AsyncStorage.removeItem('authToken');
              dispatch(logout());
            })
            .catch((error:ApiError)=>{
              console.error(error);
              // Alert.alert('Logout Error', error.message || 'Failed to logout. Please try again.');
              showAlert({
                title:'Logout Error',
                message:error.message || 'Failed to logout. Please try again.',
                buttons:[{
                  text:'ok',
                  color:Colors.btnColorPrimary,
                  textColor:Colors.btnTextPrimary,
                }]
              })
            })
          }
        }
      ]
    });

  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* <Header title="Profile" /> */}
      <LinearGradient
        colors={[Colors.background, Colors.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2C2C2C" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <TouchableOpacity onPress={() => navigation.navigate(Constants.SCREENS.PROFILE_EDIT)}>
              <Icon name="person" size={40} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userPhone}>{user?.phone || 'N/A'}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option.id)}
            >
              <Icon name={option.icon} size={24} color={Colors.textColor} />
              <Text style={styles.optionText}>{option.title}</Text>
              <Icon name="chevron-right" size={20} color={Colors.textColor} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color={Colors.background} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height:100,flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text style={{color:'#666666'}}>App Version: {Constants.APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  userSection: {
    // backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.xs,
    textTransform: 'capitalize',
  },
  userPhone: {
    fontSize: Typography.fontSize.base,
    color: Colors.textColor,
  },
  optionsSection: {
    // backgroundColor: Colors.white,
    marginBottom: Spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textWhite,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    // backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.background,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default ProfileScreen;