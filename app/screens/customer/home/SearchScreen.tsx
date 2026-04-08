import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../../utils/constants';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api/types';
import { useDispatch, useSelector} from 'react-redux';
import { RootState } from '../../../store';
import { addToCart } from '../../../store/slices/cartSlice';
import { Colors } from '@/styles/colors';

const SearchScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState(['Glass Cutter','Hammer']);

  const { categories } = useSelector((state: RootState) => state.customerHome);

  // Debounce effect for API calls
  useEffect(() => {
    // If search text is empty, clear results immediately
    if (searchText.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // Set up a delay before making the API call
    const delayTimer = setTimeout(() => {
      const getProducts = async () => {
        try {
          const res: ApiResponse = await customerAPI.getProducts({
            search: searchText,
          });
          let { data } = res.data.data;
          console.log('search api response' + JSON.stringify(data, null, 2));
          
          const filtered = data.filter(item =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.brand.toLowerCase().includes(searchText.toLowerCase()) ||
            item.category.toLowerCase().includes(searchText.toLowerCase())
          );
          setSearchResults(filtered);
          
          // Add to recent searches only after successful search with results
          if (filtered.length > 0 && searchText.trim().length > 0) {
            addToRecentSearches(searchText.trim());
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      };

      getProducts();
    }, 500); // 500ms delay - adjust this value as needed

    // Cleanup function: cancel the timeout if searchText changes
    return () => clearTimeout(delayTimer);
  }, [searchText]);

  const addToRecentSearches = (search: string) => {
    setRecentSearches(prev => {
      // Check if search already exists (case-insensitive)
      const exists = prev.some(item => item.toLowerCase() === search.toLowerCase());
      if (exists) {
        return prev;
      }
      // Add new search at the beginning and keep only last 5
      return [search, ...prev.slice(0, 4)];
    });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchText(search);
  };

  const handlePopularSearchClick = (search: string) => {
    setSearchText(search);
  };

  const handleAddToCart = (product:any) => {
    dispatch(addToCart({
      shopId: product.shop_id,
      productId: product.id,
      variantId:product.variant_id,
      quantity: 1,
      price: product.price,
      originalPrice: product?.originalPrice,
      notes: '',
    }));
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart`,
      [{ text: 'OK' }]
    );
  };

  const handleProductPress = (item:any) =>{
    navigation.navigate(Constants.SCREENS.PRODUCT_DETAIL, { product:item });
  }

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={()=>handleProductPress(item)} style={styles.resultItem}>
      <View style={styles.resultImagePlaceholder}>
        {item.images?.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={{ height: 50, width: 50 }}
          />
          ) : (
            <Text style={styles.resultEmoji}>
              {item.category === 'Beer' ? '🍺' :
              item.category === 'Vodka' ? '🍸' :
              item.category === 'Whiskey' ? '🥃' : '🍷'}
            </Text>
          )}
        
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultBrand}>{item.brand}</Text>
        <Text style={styles.resultPrice}>₹{item.price}</Text>
        <Text style={styles.resultName}>More Sizes Available</Text>
      </View>
      <TouchableOpacity onPress={()=>handleAddToCart(item)} style={styles.addButton}>
        <Icon name="add" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={Colors.textColor} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for drinks, brands..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Icon name="clear" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <ScrollView>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipContainer}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.chip}
                      onPress={() => handleRecentSearchClick(search)}
                    >
                      <Icon name="history" size={16} color="#666" />
                      <Text style={styles.chipText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.chipContainer}>
                {popularSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.popularChip}
                    onPress={() => handlePopularSearchClick(search)}
                  >
                    <Icon name="trending-up" size={16} color="#4CAF50" />
                    <Text style={styles.chipText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              {categories.map((category) => (
                <TouchableOpacity key={category.id} style={styles.categoryItem} onPress={()=>setSearchText(category.name)}>
                  {category.image ? (
                      <Image
                        source={{ uri: category.image }}
                        style={{ height: 30, width: 30 }}
                      />
                    ) : (
                      <Image
                        source={require('../../../../assets/images/app_logo.png')}
                        style={{ height: 30, width: 30 }}
                      />
                      // <Text style={styles.categoryEmoji}>🍺</Text>
                    )}
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Icon name="arrow-forward-ios" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    // paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textColor,
    marginLeft: 8,
    marginRight: 8,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 12,
    marginHorizontal:12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius:8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  clearText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    marginLeft:8,
    color: Colors.textColor,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultEmoji: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  resultBrand: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchScreen;