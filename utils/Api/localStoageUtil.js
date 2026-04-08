import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_FILTERS_KEY = 'filters'; // Key to store filters in AsyncStorage
const FILTERS_PAGE ='filterFrom';

// Store filters in AsyncStorage
export const storeFilters = async (filters,filter_page) => {
  try {
    await AsyncStorage.setItem(filter_page, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters to AsyncStorage', error);
  }
};

// Retrieve filters from AsyncStorage
export const getStoredFilters = async (filter_page) => {
  try {
    const storedFilters = await AsyncStorage.getItem(filter_page);
    return storedFilters ? JSON.parse(storedFilters) : [];
  } catch (error) {
    console.error('Failed to fetch filters from AsyncStorage', error);
    return [];
  }
};

// Clear filters from AsyncStorage (if needed)
export const clearStoredFilters = async (filter_page) => {
  try {
    await AsyncStorage.removeItem(filter_page);
  } catch (error) {
    console.error('Failed to clear filters from AsyncStorage', error);
  }
};

// Store frome where filter is called in AsyncStorage
export const storeFilterPage = async (page) => {
  try {
    await AsyncStorage.setItem(FILTERS_PAGE, page);
  } catch (error) {
    console.error('Failed to save filters page to AsyncStorage', error);
  }
};

// Retrieve frome where filter is called  from AsyncStorage
export const getStoredFiltersPage = async () => {
  try {
    const storedFilters = await AsyncStorage.getItem(FILTERS_PAGE);
    return storedFilters ? storedFilters : 'home';
  } catch (error) {
    console.error('Failed to fetch filters page from AsyncStorage', error);
    return [];
  }
};
// Store data in AsyncStorage
export const storeOfflineData= async (page,data) => {
  try {
    await AsyncStorage.setItem(page, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to AsyncStorage', error);
  }
};

// Retrieve ofline data from AsyncStorage
export const getOfflineData = async (page) => {
  try {
    const offlineData = await AsyncStorage.getItem(page);
    return offlineData ? JSON.parse(offlineData) : [];
  } catch (error) {
    console.error('Failed to fetch data from AsyncStorage', error);
    return [];
  }
};

// Change offline status
export const setOfflineStatus= async (data) => {
  try {
    await AsyncStorage.setItem('isOffline', data);
  } catch (error) {
    console.error('Failed to save data to AsyncStorage', error);
  }
};

// get offline status
export const getOfflineStatus = async () => {
  try {
    const offlineData = await AsyncStorage.getItem('isOffline');
    // Check if offlineData exists and return the corresponding status
    return offlineData === '1' ? '1' : '0'; // Return 1 for offline, 0 for online
  } catch (error) {
    console.error('Failed to fetch data from AsyncStorage', error);
    return '0'; // Default to online if an error occurs
  }
};