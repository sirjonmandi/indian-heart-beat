// ===============================================
// PRODUCT LISTING SCREEN - INFINITE SCROLL + DEBOUNCED SEARCH
// ===============================================

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Constants } from '../../../utils/constants';
import { RootState } from '../../../store';
import { addToCart, getCart } from '../../../store/slices/cartSlice';
import ProductHeader from '../../../components/customer/ProductHeader';
import ProductGrid from '../../../components/customer/ProductGrid';
import CartFooter from '../../../components/customer/CartFooter';
import { Product } from '../../../components/customer/ProductCard';
import { customerAPI } from '@/services/api/customerAPI';
import { useAlert } from '@/components/context/AlertContext';


interface RouteParams {
  category?: { id: number; name: string; icon: string; color: string };
  store?: { id: number; name: string; ratings: string; location?: string; shop_images?: string[]; distance?: number };
  brand?: { id: number; name: string; logo: string };
}

interface PaginationMeta {
  currentPage: number;
  lastPage: number;
}

const SEARCH_DEBOUNCE_MS = 500;

const ProductListingScreen: React.FC = () => {

  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const { category, store, brand } = (route.params as RouteParams) || {};
  const { itemsCount, subTotal, discountAmount } = useSelector((state: RootState) => state.cart);

  // Raw value bound to the text input
  const [searchQuery, setSearchQuery] = useState('');
  // Debounced value — API calls only fire when this changes
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ currentPage: 0, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce search input ─────────────────────────────────────────────────────
  // When the user types, wait SEARCH_DEBOUNCE_MS before committing the value.
  // Clearing on every keystroke cancels the previous pending timer.
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      // Trim so "  " is treated identically to "" — both fetch all products
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  // fetchProducts receives `search` as a parameter rather than reading from state.
  // This avoids stale-closure bugs where the effect fires with the old value
  // before the useCallback dependency has been updated.
  const fetchProducts = useCallback(
    async (page: number, replace: boolean, search: string) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const res = await customerAPI.getProducts({
          category: category?.id,
          // shop_id: store?.id,
          brand: brand?.id,
          // Pass undefined (not empty string) so the API returns ALL products
          // when the search box is empty
          search: search || undefined,
          page,
        });

        const paginated = res.data.data;
        const incoming: Product[] = paginated.data;

        setProducts(prev => (replace ? incoming : [...prev, ...incoming]));
        setPagination({ currentPage: paginated.current_page, lastPage: paginated.last_page });
      } catch (err: any) {
        console.error('fetchProducts error:', JSON.stringify(err, null, 2));
      } finally {
        if (replace) setIsLoading(false);
        else setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [category, store, brand]
    // ↑ Intentionally excludes `debouncedSearch` — search is passed as an arg
  );

  // ── Reset + fetch when screen focuses or debounced search value changes ───────
  useEffect(() => {
    if (!isFocused) return;
    setProducts([]);
    setPagination({ currentPage: 0, lastPage: 1 });
    fetchProducts(1, true, debouncedSearch);
    dispatch(getCart() as any);
  }, [isFocused, debouncedSearch]);

  // ── Load next page ────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    const { currentPage, lastPage } = pagination;
    if (isLoadingMore || isLoading || currentPage >= lastPage) return;
    fetchProducts(currentPage + 1, false, debouncedSearch);
  }, [pagination, isLoadingMore, isLoading, fetchProducts, debouncedSearch]);

  // ── Cart ──────────────────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      shopId: store?.id,
      productId: product.id,
      variantId: product.variant_id,
      quantity: 1,
      price: product.price,
      originalPrice: product?.originalPrice,
      notes: '',
    }));
    // Alert.alert('Added to Cart', `${product.name} has been added to your cart`, [{ text: 'OK' }]);
    showAlert({
       title: 'Added to Cart',
        message: `${product.name} has been added to your cart`,
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
          }
        ],
    });
  };

  const cartSummary = useMemo(() => ({
    itemCount: itemsCount || 0,
    totalAmount: subTotal - discountAmount,
  }), [itemsCount, subTotal, discountAmount]);

  return (
    <View style={styles.container}>
      <ProductHeader
        title={category?.name ?? 'Products'}
        searchText={searchQuery}
        onSearchTextChange={setSearchQuery}
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate(Constants.SCREENS.PROFILE)}
      />

      <ProductGrid
        products={products}
        title={debouncedSearch ? 'Search Results' : category?.name ?? 'All Products'}
        onProductPress={(product) =>
          navigation.navigate(Constants.SCREENS.PRODUCT_DETAIL, { product })
        }
        onAddToCart={handleAddToCart}
        refeshProduct={() => fetchProducts(1, true, debouncedSearch)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        isLoadingMore={isLoadingMore}
        isLoading={isLoading}
      />

      <CartFooter
        itemCount={cartSummary.itemCount}
        totalAmount={cartSummary.totalAmount}
        onViewCart={() => navigation.navigate(Constants.SCREENS.CART)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
});

export default ProductListingScreen;