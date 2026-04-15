import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api/authAPI';
import { ApiResponse } from '@/services/api';
import { ApiError } from '@/services/api';
import { Constants } from '@/utils/constants';
import { useAlert } from '@/components/context/AlertContext';

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { user } = useSelector((state: RootState) => state.auth);

  const mainOptions: ProfileOption[] = [
    { id: 'PROFILE_EDIT',    title: 'Profile Edit', icon: 'person',   iconBg: '#F0ECE4', iconColor: Colors.primaryBg },
    { id: 'ORDER_HISTORY',  title: 'Order History',  icon: 'receipt',    iconBg: '#E8F0FC', iconColor: '#3B6FD4' },
    { id: 'ADDRESSES',   title: 'My Addresses',   icon: 'location-on',iconBg: '#E6F4EC', iconColor: '#2E8B57' },
  ];

  const supportOptions: ProfileOption[] = [
    { id: 'HELP_SUPPORT',title: 'Help & Support', icon: 'help',       iconBg: '#E4F4F4', iconColor: '#2A8A8A' },
    { id: 'ABOUT_US',    title: 'About Us',       icon: 'info',       iconBg: '#F0EAF8', iconColor: '#7C4DBD' },
  ];

  const handleOptionPress = (optionId: string) => {
    navigation.navigate(Constants.SCREENS[optionId]);
  };

  const handleLogout = async () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          color: Colors.btnColorSecondary,
          textColor: Colors.btnTextPrimary,
        },
        {
          text: 'Logout',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
          onPress: async () => {
            await authAPI
              .logout()
              .then(async (res: ApiResponse) => {
                await AsyncStorage.removeItem('authToken');
                dispatch(logout());
              })
              .catch((error: ApiError) => {
                showAlert({
                  title: 'Logout Error',
                  message: error.message || 'Failed to logout. Please try again.',
                  buttons: [
                    {
                      text: 'OK',
                      color: Colors.btnColorPrimary,
                      textColor: Colors.btnTextPrimary,
                    },
                  ],
                });
              });
          },
        },
      ],
    });
  };

  const renderMenuGroup = (options: ProfileOption[]) => (
    <View style={styles.menuGroup}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.menuItem,
            index < options.length - 1 && styles.menuItemBorder,
          ]}
          onPress={() => handleOptionPress(option.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: option.iconBg }]}>
            <Icon name={option.icon} size={18} color={option.iconColor} />
          </View>
          <Text style={styles.menuLabel}>{option.title}</Text>
          <Icon name="chevron-right" size={20} color="#C0C0B8" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={20} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 34 }} />
        {/* <View style={styles.backBtn} /> */}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarCircle}
            // onPress={() => navigation.navigate(Constants.SCREENS.PROFILE_EDIT)}
            activeOpacity={0.85}
          >
            <Icon name="person" size={40} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userHandle}>
            {user?.phone || 'N/A'}
          </Text>

          {/* <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate(Constants.SCREENS.PROFILE_EDIT)}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity> */}
        </View>

        {/* Main Menu */}
        {renderMenuGroup(mainOptions)}

        {/* Support Menu */}
        <View style={styles.groupGap} />
        {renderMenuGroup(supportOptions)}

        {/* Logout */}
        <View style={styles.groupGap} />
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FCEAE8' }]}>
              <Icon name="logout" size={18} color="#D63A2A" />
            </View>
            <Text style={[styles.menuLabel, styles.logoutLabel]}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>App Version: {Constants.APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 50,
    backgroundColor: '#f7f6f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    letterSpacing: -0.2,
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  /* Profile */
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#A8A8A0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  userHandle: {
    fontSize: 13,
    color: '#888880',
    fontWeight: '400',
  },
  editBtn: {
    marginTop: 8,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 36,
    paddingVertical: 11,
    borderRadius: 10,
  },
  editBtnText: {
    color: '#F5F5F0',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  /* Menu Groups */
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  groupGap: {
    height: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#EBEBEB',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  logoutLabel: {
    color: '#D63A2A',
  },

  /* Version */
  versionText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: '#AAAAAA',
  },
});

export default ProfileScreen;