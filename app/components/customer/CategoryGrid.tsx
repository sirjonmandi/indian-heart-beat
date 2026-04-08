// ===============================================
// CATEGORY GRID COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color?: string;
  image?: string;
  productCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  numColumns?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryPress,
  numColumns = 3
}) => {
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchCategories = async (pageNumber = 1) => {
    if (loading) return;

    setLoading(true);

    // Example: local array pagination
    const start = (pageNumber - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const newItems = categories.slice(start, end);

    if (newItems.length < PAGE_SIZE) setHasMore(false);

    setData(prev =>
      pageNumber === 1 ? newItems : [...prev, ...newItems]
    );

    setPage(pageNumber);
    setLoading(false);
  };

  const handleSeeMore = () => {
    fetchCategories(page + 1);
  };

  useEffect(() => {
    setHasMore(true);
    fetchCategories(1);
  }, [categories]);


  const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => {
    const isLogo = false;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => onCategoryPress(item)}
      >
        <View style={styles.categoryImageContainer}>
          {isLogo ? (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>BeerGo</Text>
            </View>
          ) : (
            <View style={styles.productImageContainer}>
              {item.image ? (
                  <Image source={{uri:item.image}} style={{height:70, width:70}} resizeMode="cover"/>
              ) : (
                  <View>
                    {renderCategoryImage(item.name)}
                  </View>
              )}
            </View>
          )}
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryImage = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'whiskey':
      case 'wine':
      case 'rum':
      case 'tequila & mezcal':
        return (
          <View style={styles.darkBottleContainer}>
            <View style={styles.darkBottleImage} />
          </View>
        );
      case 'beer':
        return (
          <View style={styles.beerContainer}>
            <View style={styles.beerBottle} />
            <View style={styles.beerGlass} />
          </View>
        );
      case 'brandy':
        return (
          <View style={styles.brandyContainer}>
            <View style={styles.brandyBottle1} />
            <View style={styles.brandyBottle2} />
          </View>
        );
      case 'gin':
        return (
          <View style={styles.ginContainer}>
            <View style={styles.ginGlass} />
          </View>
        );
      case 'liqueur & bitters':
        return (
          <View style={styles.liqueurContainer}>
            <View style={styles.liqueurGlass} />
          </View>
        );
      default:
        return (
          <View style={styles.defaultContainer}>
            {/* <View style={styles.defaultBottle} /> */}
            <Image
              source={require('../../../assets/images/app_logo.png')}
              style={{height:70, width:70}} 
              resizeMode="cover"
            />
          </View>
        );
    }
  };

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity
        style={styles.seeMoreBtn}
        onPress={handleSeeMore}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textWhite} />
        ) : (
          <Text style={styles.seeMoreText}>See More</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Shop By Category</Text>
      <FlatList
        data={data}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textColor,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
  },
  categoryCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImageContainer: {
    marginBottom: 12,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkBottleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  darkBottleImage: {
    width: 40,
    height: 50,
    backgroundColor: '#4A2C17',
    borderRadius: 8,
    position: 'relative',
  },
  beerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  beerBottle: {
    width: 18,
    height: 45,
    backgroundColor: '#D2691E',
    borderRadius: 3,
    marginRight: 6,
  },
  beerGlass: {
    width: 20,
    height: 35,
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  brandyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  brandyBottle1: {
    width: 18,
    height: 45,
    backgroundColor: '#D2691E',
    borderRadius: 3,
    marginRight: 6,
  },
  brandyBottle2: {
    width: 20,
    height: 35,
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  ginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  ginGlass: {
    width: 35,
    height: 45,
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  liqueurContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  liqueurGlass: {
    width: 35,
    height: 45,
    backgroundColor: '#FFA500',
    borderRadius: 6,
  },
  defaultContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  defaultBottle: {
    width: 25,
    height: 40,
    backgroundColor: '#4A4A4A',
    borderRadius: 3,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textWhite,
    textAlign: 'center',
  },

  seeMoreBtn: {
    marginVertical: 20,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth:1,
    borderColor:Colors.primary,
    alignItems: 'center',
  },

  seeMoreText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CategoryGrid;