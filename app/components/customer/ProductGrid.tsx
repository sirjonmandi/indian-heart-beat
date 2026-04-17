// ===============================================
// PRODUCT GRID COMPONENT - WITH INFINITE SCROLL
// ===============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import ProductCard, { Product } from './ProductCard';
import { Colors } from '@/styles/colors';

interface ProductGridProps {
  products: Product[];
  title?: string;
  onProductPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  refeshProduct?: () => void;
  // ── Infinite scroll ──────────────────────────────
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoadingMore?: boolean;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title = 'Search Results',
  onProductPress,
  onAddToCart,
  refeshProduct,
  onEndReached,
  onEndReachedThreshold = 0.4,
  isLoadingMore = false,
  isLoading = false,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refeshProduct?.();
      setTimeout(() => setRefreshing(false), 500);
    } catch (error) {
      console.error('Error refreshing products:', error);
      setRefreshing(false);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={onProductPress}
      onAddToCart={onAddToCart}
    />
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>Try searching for something else</Text>
      </View>
    );
  };

  // KEY FIX: Always render the footer component — never return null.
  // With numColumns={2}, FlatList wraps the footer in a row container;
  // returning null from inside the component causes the row to still
  // render but be invisible, and React may not reconcile it correctly.
  // Instead, always render the View and use `display` to hide/show it.
  const renderFooter = () => (
    <View style={[styles.footerLoader, !isLoadingMore && styles.footerHidden]}>
      {isLoadingMore && (
        <>
          <ActivityIndicator size="small" color={Colors.primary ?? '#4CAF50'} />
          <Text style={styles.footerText}>Loading more…</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.filterButtons}>
          <Text style={styles.filterButton}>SORT</Text>
          <Text style={styles.filterButton}>FILTER</Text>
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => `${item.id}-${item.variant_id}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={renderEmptyState}
        // Pass the function reference — NOT the JSX result.
        // Passing JSX (<renderFooter />) causes it to be treated as
        // a static element and won't re-render when isLoadingMore changes.
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    fontSize: 12,
    color: Colors.black,
    marginLeft: 16,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  // Collapses the footer to zero height when not loading
  footerHidden: {
    paddingVertical: 0,
    height: 0,
    overflow: 'hidden',
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
});

export default ProductGrid;