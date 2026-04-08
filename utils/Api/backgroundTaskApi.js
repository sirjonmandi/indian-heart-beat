import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import { Alert } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { DeviceEventEmitter } from 'react-native';

export const navigationRef = createNavigationContainerRef();

const db = SQLite.openDatabase({ name: 'accessToken.db', location: 'default' });

const api = axios.create({
  // baseURL: 'https://api.taskman.online/api', //Local BaseURL
  // baseURL: 'http://13.233.2.223:8082/api/', //Dev BaseURL
  // baseURL: 'https://306ac83dd868f24e19b83fffb9df1761.serveo.net/api/', // Prasenjit
  baseURL: 'http://13.127.164.87:8082/api/', //Staging BaseURL
  timeout: 480000,  // 8 minutes timeout,  
});

// const isNetworkReachable = async () => {
//   const timeout = 100000; // Adjust timeout as needed (milliseconds)
//   const controller = new AbortController();
//   const signal = controller.signal;

//   const timer = setTimeout(() => controller.abort(), timeout);

//   try {
//     const response = await fetch('http://13.233.2.223:8082/api/', { signal });
//     clearTimeout(timer);
//     return response.ok; // Return true if the response is okay
//   } catch (error) {
//     clearTimeout(timer);
//     if (error.name === 'AbortError') {
//       return false; // Likely offline due to timeout
//     }
//     // Handle any other types of network errors
//     return false; 
//   }
// };

const getAuthToken = async () => {
  let token = await AsyncStorage.getItem('access_token');

  if (!token) {
    await new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql('SELECT access_token FROM token_table;', [], (tx, results) => {
          if (results.rows.length > 0) {
            token = results.rows.item(0).access_token;
            AsyncStorage.setItem('access_token', token);
          }
          resolve();
        });
      });
    });
  }

  return token;
};

// Add a request interceptor
// Interceptor to add the token to headers and check internet connection
api.interceptors.request.use(

  async (config) => {
 
    // // Check network status
    // NetInfo.fetch().then(state => {
    //   if (!state.isConnected) {
    //     // Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
    //     // navigationRef.navigate('NoInternet');
    //   }
    //   else {
    //     console.log('Internet Connection Available');
    //   }
    // });


    // URL path to exclude
    const excludedPaths = ['login']; // Add other paths to exclude if needed
    // Check if the request URL is in the excluded paths
    const shouldExclude = excludedPaths.some(path => config.url.includes(path));
    if (!shouldExclude) {
      const token = await getAuthToken(); // Ensure getAuthToken is correctly implemented
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        // config.headers['Content-Type'] = 'application/json';
      }
      // Conditionally set Content-Type if data is not FormData
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }else{
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }

    // console.log('Starting Request', config);
    return config;
  },
  (error) => {
    // console.log('Request Error: ', error);
    return Promise.reject(error);
  }
);
// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('222222222222222222: ', error);
    if (error.response && error.response.status === 401) {
      // Navigate to login screen
      if (navigationRef.isReady()) {
        navigationRef.navigate('Login');
      } else {
        // Alert.alert('Session expired', 'Please log in again.');
        // navigationRef.navigate('Login');
      }
    }
    // Handle network error
    if (error.code === 'ERR_NETWORK') {
      const requestUrl = error.config?.url || '';
      const requestMethod = error.config?.method || '';

      // Check if the URL does not contain 'notificationCount?user_id'
      if (!requestUrl.includes('notificationCount?user_id') && requestMethod.toLowerCase() !== 'get') {
        // Emit offline event
        DeviceEventEmitter.emit('application.offline', {});
      }
    }
    return Promise.reject(error);
  }
);

export default api;
