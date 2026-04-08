import { Alert, PermissionsAndroid, Platform, Linking } from "react-native";
import { getMessaging, registerDeviceForRemoteMessages, getToken } from '@react-native-firebase/messaging';
import { authAPI } from "@/services/api/authAPI";
import FileViewer from 'react-native-file-viewer';
const requestToken = async () => {
    try {
        const messaging = getMessaging();
        if (Platform.OS === 'ios') {
            await registerDeviceForRemoteMessages(messaging);
        }
        const token = await getToken(messaging);
        const response = await authAPI.storeDeviceToken(token);
        if(!response.data.success) {
            console.log('Error Response', JSON.stringify(response, null, 2));
        } else {
            console.log('Token is stored in DB');
        }
    } catch (error: any) {
        console.log("Error while getting notification token", error, error?.message);
    }
}

export const NotificationRequest = async () => {
    try {
        // Check Android version
        if (Platform.OS === 'android' && Platform.Version < 33) {
            // For Android 12 and below, no runtime permission needed
            console.log('Android version < 13, no permission request needed');
            await requestToken();
            return;
        }

        // Check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (checkResult) {
            console.log('Notification permission already granted');
            await requestToken();
            return;
        }

        // Request permission for Android 13+
        const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
            await requestToken();
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('Notification permission permanently denied');
            Alert.alert(
                'Permission Required',
                'Notification permission was denied. Please enable it in Settings > Apps > [Your App] > Permissions.',
                [{ text: 'OK' }]
            );
        } else {
            console.log('Notification permission denied');
            Alert.alert('Permission Required', 'Notification access denied!');
        }
    } catch (error: any) {
        console.log('Notification Error', error);
        Alert.alert(
            'Error',
            error.message || 'An error occurred while requesting notification permissions.'
        );        
    }
}

// Request storage permission for Android
// export const requestStoragePermission = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         {
//           title: 'Storage Permission',
//           message: 'App needs access to your storage to download files',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (err) {
//       console.warn(err);
//       return false;
//     }
//   }
//   return true;
// };

export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need storage permissions for app directories
  }

  try {
    const androidVersion = Platform.Version;

    // Android 13+ (API 33+) - Granular media permissions
    if (androidVersion >= 33) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        // Add if you need audio files
        // PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      return Object.values(granted).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    }

    // Android 10-12 (API 29-32) - Scoped storage
    if (androidVersion >= 29 && androidVersion < 33) {
      // For downloads to public directories, no permission needed with scoped storage
      // For external storage access, use READ_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android 6-9 (API 23-28) - Traditional storage permissions
    if (androidVersion >= 23) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android 5 and below (API < 23) - Permissions granted at install time
    return true;
  } catch (err) {
    console.error('Storage permission error:', err);
    // Alert.alert('Permission Error', 'Failed to request storage permission');
    return false;
  }
};

// Open the downloaded file
export const openFile = (filePath: string) => {
  if (Platform.OS === 'android') {
    // For Android, you might need react-native-file-viewer or similar
    // RNFS.scanFile(filePath); // Makes file visible in gallery/downloads
    Alert.alert(
      'Download Complete',
      `File saved to: ${filePath}`,
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            // You can use react-native-file-viewer here
            FileViewer.open(filePath);
          },
        },
      ]
    );
  } else {
    Alert.alert(
      'Download Complete',
      `File saved to: ${filePath}`,
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            Linking.openURL(`file://${filePath}`).catch(() => {
              Alert.alert('Error', 'Cannot open file');
            });
          },
        },
      ]
    );
  }
};