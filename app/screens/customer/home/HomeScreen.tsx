import { Colors } from '@/styles/colors';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  SafeAreaView,
  FlatList,
  Dimensions,
  ImageBackground,
  Modal,
  KeyboardAvoidingView,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FoodItemModal from '@/components/common/FoodItemModal';
import { useNavigation } from '@react-navigation/native';
import { Constants } from '@/utils/constants';

// Type definitions
interface FoodItem {
  id: number;
  emoji: any;
  name: string;
  rating: string;
  reviews: string;
  time: string;
  difficulty: string;
  store: string;
  price: number;
}

interface ModalItem {
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
  };
}

interface FoodCardProps extends FoodItem {
  wide?: boolean;
  onPress?: (item: FoodItem) => void;
}

interface Category {
  image: any;
  label: string;
  onpress: () => void;
}

const { width } = Dimensions.get('window');

// ─── Placeholder image components ──────────────────────────────────────────
const SushiBanner = () => (
  <View style={styles.sushiPlaceholder}>
    {/* <Text style={styles.sushiEmoji}>🍣</Text> */}
    <Image source={require('../../../../assets/foods/sushi.png')} style={{ width: 240, height: 240 }} />
  </View>
);

const CategoryCircle = ({ image, label, onpress }: Category) => (
  <TouchableOpacity onPress={onpress}>
    <View style={styles.categoryItem}>
      <View style={styles.categoryCircle}>
        <Image source={image} style={{ width: 50, height: 50, borderRadius:50, }} />
        <Text style={styles.categoryLabel}>{label}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const FoodCard = ({ id, emoji, name, rating, reviews, time, difficulty, store, price, wide, onPress }: FoodCardProps) => (
  <View style={[styles.foodCard, wide && { width: width * 0.7 }]}>
    <ImageBackground source={emoji} style={{ flex: 1 }} imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
      {/* Food Image */}
      <View style={styles.foodImageContainer}>
        {/* <View style={styles.foodImagePlaceholder}>
          <Text style={styles.foodEmoji}>{emoji}</Text>
        </View> */}
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Icon name='star' size={15} color='#FFD700' />
          <Text style={styles.ratingText}> {rating} ({reviews})</Text>
        </View>
        {/* Favourite */}
        <TouchableOpacity style={styles.favButton}>
          <Icon name='favorite-border' size={17} color='#FF4B6E' />
        </TouchableOpacity>
      </View>

      {/* Card Footer */}
      <View style={styles.foodCardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.foodName}>{name}</Text>
          <View style={styles.foodMeta}>
            <Icon name='access-time' size={11} color={GRAY} />
            <Text style={styles.metaText}> {time}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{difficulty}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>By {store}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={() => {
            if (onPress) {
              onPress({ id, emoji, name, rating, reviews, time, difficulty, store, price });
            }
          }}
          >
          <Icon name='arrow-outward' size={16} color={WHITE} /> 
        </TouchableOpacity>
      </View>
    </ImageBackground>
  </View>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const navigation = useNavigation();
  const categories = [
    { image: require('../../../../assets/foods/salad.jpg'), label: 'Salads' },
    { image: require('../../../../assets/foods/chinese.jpg'), label: 'Chinese Food' },
    { image: require('../../../../assets/foods/indian.jpg'), label: 'Indian Food' },
    { image: require('../../../../assets/foods/fast.jpg'), label: 'Fast Food' },
    { image: require('../../../../assets/foods/korean.jpg'), label: 'Korean Food' },
  ];

  const picks = [
    { id: 1, emoji: require('../../../../assets/foods/indian.jpg'), name: 'Biryani', rating: '4.9', reviews: '3.3k', time: '25 min', difficulty: 'Easy', store: 'Indian Heart Beat', price: 449 },
    { id: 2, emoji: require('../../../../assets/foods/fast.jpg'), name: 'Pizza', rating: '4.5', reviews: '1.8k', time: '20 min', difficulty: 'Easy', store: 'Indian Heart Beat', price: 199 },
    { id: 3, emoji: require('../../../../assets/foods/chinese.jpg'), name: 'Momo', rating: '4.7', reviews: '2.3k', time: '25 min', difficulty: 'Easy', store: 'Indian Heart Beat', price: 149 },
    { id: 4, emoji: require('../../../../assets/foods/korean.jpg'), name: 'Ramen', rating: '4.3', reviews: '1.3k', time: '20 min', difficulty: 'Easy', store: 'Indian Heart Beat', price: 499 },
  ];

  const handleFoodCardPress = (item: FoodItem) => {
    const modalItem = {
      id: item.id.toString(),
      name: item.name,
      restaurant: item.store,
      rating: parseFloat(item.rating),
      price: item.price,
      deliveryTime: item.time,
      deliveryType: item.difficulty,
      description: `Delicious ${item.name} prepared with care. ${item.difficulty} to prepare and delivered in ${item.time}.`,
      imageUri: item.emoji,
      driver: {
        name: 'John Doe',
        id: '123456',
      },
    };
    setSelectedItem(modalItem);
    setVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView 
      style={styles.scroll} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
        refreshing={false} 
        onRefresh={() => {}}
        colors={[ORANGE]} // Android
        tintColor={ORANGE} // iOS
        title="Pull to refresh" // iOS
        titleColor="#999" // iOS
        />
      }
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}><Icon name='location-pin' size={15} color={DARK}/> Location</Text>
            <TouchableOpacity style={styles.locationRow}>
              <Text style={styles.locationText}>gt road, Durgapur, India</Text>
              <Icon name='expand-more' size={26} color={DARK} style={styles.chevron} />
            </TouchableOpacity>
          </View>
          <View style={styles.cartWrapper}>
            <TouchableOpacity 
            style={styles.cartBtn}
            onPress={()=>navigation.navigate(Constants.SCREENS.CART)}
            >
              <Icon name='local-mall' size={20} color={DARK} style={styles.cartIcon} />
            </TouchableOpacity>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </View>
        </View>

        {/* ── Search + Filter ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name='search' size={20} color={GRAY} />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#AAAAAA"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity 
          style={styles.filterBtn}
          onPress={()=>Alert.alert('Notificaton','Functionality yet to be implemented !')}
          >
            <Text style={styles.filterText}>Filter</Text>
            <View style={{ backgroundColor:WHITE, height:45, width : 45, padding:4, borderRadius:50, marginLeft:6, alignItems:'center', justifyContent:'center' }}>
              <Icon name="tune" size={20} color={GRAY} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Promo Banner ── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoTitle}>Gonna Be a{'\n'}Good Day!</Text>
            <Text style={styles.promoSub}>Free delivery, lower fees, &{'\n'}</Text>
            <Text style={styles.promoHighlight}>10% cashback, pickup!</Text>
            <TouchableOpacity 
            style={styles.orderNowBtn}
            onPress={() => Alert.alert('Order Pressed','Functionality yet to be implemented !')}
            >
              <Text style={styles.orderNowText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoRight}>
            <SushiBanner />
          </View>
        </View>

        {/* ── Categories ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categories.map((cat, i) => (
            <CategoryCircle key={i} image={cat.image} label={cat.label} onpress={() => {Alert.alert('Category Pressed', 'screen yet to be implemented !')}} />
          ))}
        </ScrollView>

        {/* ── Picks For You ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Picks For You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          {picks.map((p, i) => (
            <FoodCard key={i} {...p} wide onPress={handleFoodCardPress} />
          ))}
        </ScrollView>

        <View style={{ height: 80 }} />
      </ScrollView>

      <FoodItemModal
        visible={visible}
        onClose={() => setVisible(false)}
        item={selectedItem || undefined}
        addToCart={(id) => Alert.alert('Add to Cart', `Item ID: ${id} - Functionality yet to be implemented !`)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const ORANGE = Colors.primaryBg;
const BG = '#FFFFFF';
const WHITE = '#f7f6f9ff';
const DARK = '#1A1A1A';
const GRAY = '#888888';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  locationLabel: {
    fontSize: 15,
    color: DARK,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },
  chevron: {
    fontSize: 16,
    color: DARK,
  },
  cartWrapper: {
    position: 'relative',
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: 25,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Search
  searchRow: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 20,
    marginBottom: 16,
    marginHorizontal: 14,
    borderRadius: 50,
    // gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 50,
    paddingHorizontal: 14,
    height: 48,
    // elevation: 1,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK,
    fontWeight: '500',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    borderRadius: 50,
    paddingLeft: 10,
    paddingRight: 2,
    height: 48,
    width: 120,
    margin:2,
  },
  filterText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 12,
  },
  filterIcon: {
    color: WHITE,
    fontSize: 16,
  },

  // ── Promo Banner
  promoBanner: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: ORANGE,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 140,
  },
  promoLeft: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: WHITE,
    lineHeight: 26,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
  },
  promoHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 14,
  },
  orderNowBtn: {
    backgroundColor: WHITE,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  orderNowText: {
    color: ORANGE,
    fontWeight: '700',
    fontSize: 13,
  },
  promoRight: {
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sushiPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sushiEmoji: {
    fontSize: 64,
  },

  // ── Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },
  seeAll: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '500',
  },

  // ── Categories
  categoriesRow: {
    marginBottom: 24,
    flexGrow: 0,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 18,
  },
  categoryCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 100,
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 14,
    color: DARK,
    fontWeight: '600',
    textAlign: 'center',
    paddingLeft: 16,
    paddingRight: 24,
  },

  // ── Food Card
  foodCard: {
    width: width * 0.65,
    backgroundColor: WHITE,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  foodImageContainer: {
    height: 170,
    position: 'relative',
  },
  foodImagePlaceholder: {
    flex: 1,
    backgroundColor: '#FFE8D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodEmoji: {
    fontSize: 72,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  favIcon: {
    fontSize: 17,
    color: '#FF4B6E',
  },
  foodCardFooter: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    // height: 90,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
    marginBottom: 4,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    color: GRAY,
  },
  metaDot: {
    fontSize: 11,
    color: GRAY,
    marginHorizontal: 3,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  arrowIcon: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabIcon: {
    fontSize: 20,
    color: GRAY,
    marginBottom: 2,
  },
  tabIconActive: {
    color: ORANGE,
  },
  tabLabel: {
    fontSize: 11,
    color: GRAY,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: ORANGE,
    fontWeight: '700',
  },
});