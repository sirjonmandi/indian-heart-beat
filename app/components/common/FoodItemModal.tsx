import { Colors } from '@/styles/colors';
import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  PanResponder,
  Platform,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75; // 0.82
const ORANGE = Colors.primaryBg;
const CARD_BG = '#ffffff';

// ─── Styles defined FIRST so sub-components below can reference them ──────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
  },
  heroContainer: {
    height: MODAL_HEIGHT * 0.36,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  heroTopBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  backArrow: {
    fontSize: 26,
    color: Colors.black,
    lineHeight: 28,
    marginTop: -2,
  },
  heroActions: {
    flexDirection: 'row',
  },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: 8,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 10,
  },
  dragPill: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  restaurantName: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingStar: {
    color: ORANGE,
    fontSize: 14,
    marginRight: 3,
  },
  ratingText: {
    color: ORANGE,
    fontWeight: '700',
    fontSize: 14,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFE0D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  driverInfo: {
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
  },
  driverId: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  driverActions: {
    flexDirection: 'row',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7f6f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // elevation: 2,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888',
    lineHeight: 21,
  },
  readMore: {
    color: ORANGE,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deliveryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  deliveryDivider: {
    width: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
  },
  deliveryLabel: {
    fontSize: 11,
    color: '#AAA',
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  priceBox: {
    backgroundColor: ORANGE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,

  },
  priceText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  cartBtn: {
    // flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius:50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
  },
  cartBtnText: {
    color: Colors.black,
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

// ─── Sub-components (AFTER styles — safe to reference styles now) ─────────────

const BikeIcon = () => (
  <View style={styles.iconBox}>
    <Icon name="directions-bike" size={18} color="#1A1A1A" />
  </View>
);

const BoxIcon = () => (
  <View style={styles.iconBox}>
    <Icon name="inventory-2" size={18} color="#1A1A1A" />
  </View>
);

const MessageIcon = () => (
  <View style={styles.actionIconCircle}>
    <Icon name="message" size={18} color="#1A1A1A" />
  </View>
);

const PhoneIcon = () => (
  <View style={styles.actionIconCircle}>
    <Icon name="call" size={18} color="#1A1A1A" />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoodItemModalProps {
  visible: boolean;
  onClose: () => void;
  addToCart:(id: string) =>void;
  item?: {
    id: string;
    name: string;
    restaurant: string;
    rating: number;
    price: number;
    deliveryTime: string;
    deliveryType: string;
    description: string;
    imageUri: string;
    driver: {
      name: string;
      id: string;
      avatarUri?: string;
    };
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FoodItemModal: React.FC<FoodItemModalProps> = ({
  visible,
  onClose,
  addToCart,
  item = {
    id: '1',
    name: 'Taco Bell',
    restaurant: "McDonald's",
    rating: 4.7,
    price: 25.0,
    deliveryTime: '25 min',
    deliveryType: 'Taco Bell',
    description:
      "From fresh bread to dairy, we've got all your groceries. Shop now, and we'll deliver them fast! Shop now, and we'll deliver them fast!",
    imageUri: require('../../../assets/foods/indian.jpg'),
    driver: {
      name: 'Mitchel Santnar',
      id: '13256626',
    },
  },
}) => {
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.5) {
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: MODAL_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      translateY.setValue(MODAL_HEIGHT);
    });
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}  {...panResponder.panHandlers}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={item.imageUri} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroGradient} />
          <View style={styles.heroTopBar}>
            <TouchableOpacity style={styles.backBtn} onPress={closeModal}>
              <Icon name="keyboard-arrow-left" size={20} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroActionBtn}>
                <Icon name="favorite-border" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroActionBtn}>
                <Icon name="share" size={18} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentWrapper}>
          <View style={styles.dragPill} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title Row */}
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.restaurantName}>By {item.restaurant}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>

            {/* Driver Row */}
            {/* <View style={styles.driverRow}>
              <View style={styles.driverLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>👨‍🍳</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{item.driver.name}</Text>
                  <Text style={styles.driverId}>ID: {item.driver.id}</Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <MessageIcon />
                <PhoneIcon />
              </View>
            </View> */}

            <View style={styles.divider} />

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
              {item.description}
            </Text>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.readMore}>{expanded ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Delivery Info */}
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryCard}>
                <BikeIcon />

                <View>
                  <Text style={styles.deliveryLabel}>Delivery Time</Text>
                  <Text style={styles.deliveryValue}>{item.deliveryTime}</Text>
                </View>
              </View>
              <View style={styles.deliveryDivider} />
              <View style={styles.deliveryCard}>
                <BoxIcon />
                <View>
                  <Text style={styles.deliveryLabel}>Delivery Type</Text>
                  <Text style={styles.deliveryValue}>{item.deliveryType}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Add to Cart */}
          <View style={styles.cartBar}>
            <View style={{flexDirection:'row',alignItems:'center', justifyContent:'space-between', backgroundColor:ORANGE, borderRadius:50, paddingHorizontal:4, paddingVertical:4, width:'100%'}}>
                <View style={styles.priceBox}>
                    <Text style={styles.priceText}>₹ {item.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                style={styles.cartBtn} activeOpacity={0.85} onPress={() => addToCart(item.id)}>
                    <Text style={styles.cartBtnText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default FoodItemModal;