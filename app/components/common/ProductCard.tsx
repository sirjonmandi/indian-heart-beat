import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import {Spacing} from '../../styles/spacing'
import { Product } from '../../store/types';

const { width } = Dimensions.get('window');

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  style?: ViewStyle;
  variant?: 'grid' | 'list' | 'horizontal' | 'minimal';
  showQuickActions?: boolean;
  showDeliveryTime?: boolean;
  showWishlist?: boolean;
  isInWishlist?: boolean;
  isInCart?: boolean;
  cartQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  showCompare?: boolean;
  onCompareToggle?: () => void;
  isComparing?: boolean;
  customWidth?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onWishlistToggle,
  style,
  variant = 'grid',
  showQuickActions = true,
  showDeliveryTime = true,
  showWishlist = false,
  isInWishlist = false,
  isInCart = false,
  cartQuantity = 0,
  onQuantityChange,
  showCompare = false,
  onCompareToggle,
  isComparing = false,
  customWidth,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Calculate dimensions based on variant
  const getCardDimensions = () => {
    if (customWidth) {
      return { width: customWidth };
    }
    
    switch (variant) {
      case 'grid':
        return { width: (width - Spacing.md * 3) / 2 };
      case 'horizontal':
        return { width: 200 };
      case 'minimal':
        return { width: 150 };
      case 'list':
      default:
        return { width: '100%' };
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleAddToCart = () => {
    if (!product.inStock) return;
    onAddToCart?.();
  };

  const handleWishlistToggle = () => {
    onWishlistToggle?.();
  };

  const handleQuantityIncrease = () => {
    if (onQuantityChange && product.inStock) {
      onQuantityChange(cartQuantity + 1);
    }
  };

  const handleQuantityDecrease = () => {
    if (onQuantityChange && cartQuantity > 0) {
      onQuantityChange(cartQuantity - 1);
    }
  };

  const renderDiscountBadge = () => {
    if (!product.originalPrice) return null;
    
    const discountPercentage = Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );

    return (
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
      </View>
    );
  };

  const renderWishlistButton = () => {
    if (!showWishlist) return null;

    return (
      <TouchableOpacity 
        style={styles.wishlistButton}
        onPress={handleWishlistToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon 
          name={isInWishlist ? 'favorite' : 'favorite-border'} 
          size={20} 
          color={isInWishlist ? Colors.error : Colors.white} 
        />
      </TouchableOpacity>
    );
  };

  const renderCompareButton = () => {
    if (!showCompare) return null;

    return (
      <TouchableOpacity 
        style={[styles.compareButton, isComparing && styles.compareButtonActive]}
        onPress={onCompareToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon 
          name="compare-arrows" 
          size={18} 
          color={isComparing ? Colors.primary : Colors.white} 
        />
      </TouchableOpacity>
    );
  };

  const renderStockBadge = () => {
    if (product.inStock) return null;

    return (
      <View style={styles.stockBadge}>
        <Text style={styles.stockBadgeText}>Out of Stock</Text>
      </View>
    );
  };

  const renderProductImage = () => (
    <View style={[
      styles.imageContainer,
      variant === 'list' && styles.listImageContainer,
      variant === 'horizontal' && styles.horizontalImageContainer,
      variant === 'minimal' && styles.minimalImageContainer,
    ]}>
      {/* Product Image Placeholder */}
      <View style={[
        styles.imagePlaceholder,
        variant === 'list' && styles.listImagePlaceholder,
        variant === 'horizontal' && styles.horizontalImagePlaceholder,
        variant === 'minimal' && styles.minimalImagePlaceholder,
        !product.inStock && styles.imageOutOfStock,
      ]}>
        {/* You can replace this with actual Image component */}
        <Icon name="local-drink" size={40} color={Colors.gray400} />
      </View>

      {/* Overlay elements */}
      {renderDiscountBadge()}
      {renderWishlistButton()}
      {renderCompareButton()}
      {renderStockBadge()}

      {/* Quick view button for grid variant */}
      {variant === 'grid' && showQuickActions && (
        <TouchableOpacity style={styles.quickViewButton} onPress={onPress}>
          <Icon name="visibility" size={16} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderProductInfo = () => (
    <View style={[
      styles.content,
      variant === 'list' && styles.listContent,
      variant === 'minimal' && styles.minimalContent,
    ]}>
      {/* Product Name */}
      <Text 
        style={[
          styles.productName,
          variant === 'minimal' && styles.minimalProductName,
        ]} 
        numberOfLines={variant === 'list' ? 1 : 2}
      >
        {product.name}
      </Text>

      {/* Brand */}
      {variant !== 'minimal' && (
        <Text style={styles.brand}>{product.brand}</Text>
      )}

      {/* Product Details */}
      {variant !== 'minimal' && (
        <View style={styles.detailsRow}>
          <Text style={styles.volume}>{product.volume}</Text>
          <Text style={styles.alcoholContent}>{product.alcoholPercentage}% ABV</Text>
        </View>
      )}

      {/* Rating */}
      {variant !== 'minimal' && (
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color={Colors.warning} />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
      )}

      {/* Delivery Time */}
      {showDeliveryTime && variant !== 'minimal' && (
        <View style={styles.deliveryTimeContainer}>
          <Icon name="access-time" size={12} color={Colors.success} />
          <Text style={styles.deliveryTime}>Ready in {product.preparationTime} min</Text>
        </View>
      )}

      {/* Price and Actions */}
      <View style={[
        styles.priceActionContainer,
        variant === 'list' && styles.listPriceActionContainer,
      ]}>
        <View style={styles.priceContainer}>
          <Text style={[
            styles.price,
            variant === 'minimal' && styles.minimalPrice,
          ]}>
            ₹{product.price}
          </Text>
          {product.originalPrice && variant !== 'minimal' && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>

        {/* Add to Cart / Quantity Controls */}
        {showQuickActions && (
          <View style={styles.actionContainer}>
            {isInCart && cartQuantity > 0 ? (
              <View style={styles.quantityContainer}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={handleQuantityDecrease}
                >
                  <Icon name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{cartQuantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={handleQuantityIncrease}
                  disabled={!product.inStock}
                >
                  <Icon 
                    name="add" 
                    size={16} 
                    color={product.inStock ? Colors.primary : Colors.gray400} 
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  !product.inStock && styles.addButtonDisabled,
                  variant === 'minimal' && styles.minimalAddButton,
                ]}
                onPress={handleAddToCart}
                disabled={!product.inStock}
              >
                <Icon 
                  name="add" 
                  size={variant === 'minimal' ? 16 : 18} 
                  color={product.inStock ? Colors.white : Colors.gray500} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && variant !== 'minimal' && (
        <View style={styles.tagsContainer}>
          {product.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const cardStyle = [
    styles.card,
    styles[`${variant}Card`],
    getCardDimensions(),
    !product.inStock && styles.cardOutOfStock,
    style,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={!product.inStock && variant !== 'grid'}
      >
        {variant === 'list' ? (
          <View style={styles.listLayout}>
            {renderProductImage()}
            {renderProductInfo()}
          </View>
        ) : (
          <>
            {renderProductImage()}
            {renderProductInfo()}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Base Card Styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  
  // Variant-specific card styles
  gridCard: {
    // Default grid styling
  },
  listCard: {
    marginHorizontal: 0,
  },
  horizontalCard: {
    marginRight: Spacing.md,
  },
  minimalCard: {
    marginRight: Spacing.sm,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  
  cardOutOfStock: {
    opacity: 0.7,
  },

  // Layout Styles
  listLayout: {
    flexDirection: 'row',
  },

  // Image Container Styles
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  listImageContainer: {
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    width: 100,
  },
  horizontalImageContainer: {
    height: 140,
  },
  minimalImageContainer: {
    height: 100,
  },

  // Image Placeholder Styles
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listImagePlaceholder: {
    width: 100,
    height: 100,
  },
  horizontalImagePlaceholder: {
    height: 140,
  },
  minimalImagePlaceholder: {
    height: 100,
  },
  imageOutOfStock: {
    backgroundColor: Colors.gray300,
  },

  // Badge Styles
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  stockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stockBadgeText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },

  // Action Button Styles
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  compareButton: {
    position: 'absolute',
    top: 48,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  compareButtonActive: {
    backgroundColor: Colors.white,
  },
  quickViewButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  // Content Styles
  content: {
    padding: Spacing.md,
    flex: 1,
  },
  listContent: {
    paddingLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  minimalContent: {
    padding: Spacing.sm,
  },

  // Text Styles
  productName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.fontSize.sm * 1.3,
  },
  minimalProductName: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs / 2,
  },
  brand: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  volume: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  alcoholContent: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  // Rating Styles
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  rating: {
    marginLeft: 2,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  reviewCount: {
    marginLeft: 2,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  // Delivery Time Styles
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deliveryTime: {
    marginLeft: 4,
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontWeight: Typography.fontWeight.medium,
  },

  // Price and Action Styles
  priceActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  listPriceActionContainer: {
    marginTop: 'auto',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  minimalPrice: {
    fontSize: Typography.fontSize.sm,
  },
  originalPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },

  // Action Container Styles
  actionContainer: {
    marginLeft: Spacing.sm,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  addButtonDisabled: {
    backgroundColor: Colors.gray300,
  },

  // Quantity Control Styles
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    paddingHorizontal: Spacing.xs,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },

  // Tags Styles
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default ProductCard;