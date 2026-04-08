import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ImageCarousel
 *
 * A 16:9 snap carousel component inspired by react-native-snap-carousel.
 *
 * Props:
 *  - data        {Array}    Required. Array of slide objects.
 *  - sliderWidth {number}   Width of the carousel. Defaults to screen width.
 *  - loop        {boolean}  Enable infinite looping. Defaults to false.
 *  - autoplay    {boolean}  Enable autoplay. Defaults to false.
 *  - autoplayInterval {number} Autoplay delay in ms. Defaults to 3000.
 *  - showDots    {boolean}  Show pagination dots. Defaults to true.
 *  - showArrows  {boolean}  Show prev/next arrow buttons. Defaults to true.
 *  - renderItem  {Function} Custom render function ({ item, index }) => ReactNode.
 *                           Receives the slide data and index.
 *  - onSnapToItem {Function} Callback fired when slide changes. Receives index.
 *
 * Default slide object shape (used by built-in renderItem):
 *  { id, image: { uri }, title, subtitle }
 */

const DEFAULT_SLIDES = [
  {
    id: '1',
    image: { uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=80' },
    title: 'Mountain Serenity',
    subtitle: 'Swiss Alps, Switzerland',
  },
  {
    id: '2',
    image: { uri: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1280&q=80' },
    title: 'Valley of Dreams',
    subtitle: 'Lauterbrunnen Valley',
  },
  {
    id: '3',
    image: { uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1280&q=80' },
    title: 'Into the Wild',
    subtitle: 'Pacific Northwest, USA',
  },
  {
    id: '4',
    image: { uri: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1280&q=80' },
    title: 'Golden Hour',
    subtitle: 'Tuscany, Italy',
  },
  {
    id: '5',
    image: { uri: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1280&q=80' },
    title: 'Desert Bloom',
    subtitle: 'Sahara, Morocco',
  },
];

// ─── Default slide renderer ───────────────────────────────────────────────────

const DefaultSlide = ({ item, slideWidth, slideHeight }) => (
  <View style={[styles.slide, { width: slideWidth, height: slideHeight }]}>
    <Image
      source={item.image}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    />
    {(item.title || item.subtitle) && (
      <View style={styles.captionOverlay}>
        {item.title && <Text style={styles.captionTitle}>{item.title}</Text>}
        {item.subtitle && <Text style={styles.captionSub}>{item.subtitle}</Text>}
      </View>
    )}
  </View>
);

// ─── Arrow button ─────────────────────────────────────────────────────────────

const ArrowButton = ({ direction, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.arrowBtn, disabled && styles.arrowDisabled]}
    activeOpacity={0.7}
    accessibilityLabel={direction === 'prev' ? 'Previous slide' : 'Next slide'}
    accessibilityRole="button"
  >
    <Text style={[styles.arrowText, disabled && styles.arrowTextDisabled]}>
      {direction === 'prev' ? '‹' : '›'}
    </Text>
  </TouchableOpacity>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ImageCarousel = ({
  data = DEFAULT_SLIDES,
  sliderWidth = SCREEN_WIDTH,
  loop = false,
  autoplay = false,
  autoplayInterval = 3000,
  showDots = true,
  showArrows = true,
  renderItem,
  onSnapToItem,
}) => {
  const slideHeight = sliderWidth * (9 / 16);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoplayTimer = useRef(null);

  const totalSlides = data.length;

  // ── Autoplay ────────────────────────────────────────────────────────────────

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    autoplayTimer.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = prev + 1 >= totalSlides ? (loop ? 0 : prev) : prev + 1;
        if (next !== prev) scrollToIndex(next);
        return next;
      });
    }, autoplayInterval);
  }, [autoplay, autoplayInterval, loop, totalSlides]);

  const stopAutoplay = useCallback(() => {
    clearInterval(autoplayTimer.current);
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const goTo = (index) => {
    const clamped = loop
      ? (index + totalSlides) % totalSlides
      : Math.max(0, Math.min(totalSlides - 1, index));
    setActiveIndex(clamped);
    scrollToIndex(clamped);
    onSnapToItem?.(clamped);
  };

  // ── Scroll handler ──────────────────────────────────────────────────────────

  const onMomentumScrollEnd = (e) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / sliderWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
      onSnapToItem?.(index);
    }
  };

  // ── Render each item ────────────────────────────────────────────────────────

  const renderSlide = ({ item, index }) => {
    if (renderItem) return renderItem({ item, index });
    return (
      <DefaultSlide
        item={item}
        slideWidth={sliderWidth}
        slideHeight={slideHeight}
      />
    );
  };

  const keyExtractor = (item, index) => item.id ?? String(index);

  // ── Pagination dots ─────────────────────────────────────────────────────────

  const renderDots = () => (
    <View style={styles.dotsRow}>
      {data.map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => goTo(i)}
          accessibilityLabel={`Go to slide ${i + 1}`}
          accessibilityRole="button"
        >
          <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { width: sliderWidth }]}>
      {/* Slide list */}
      <View style={{ borderRadius: 12, overflow: 'hidden' }}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          snapToInterval={sliderWidth}
          snapToAlignment="start"
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.98}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={stopAutoplay}
          onScrollEndDrag={startAutoplay}
          getItemLayout={(_, index) => ({
            length: sliderWidth,
            offset: sliderWidth * index,
            index,
          })}
          initialScrollIndex={0}
        />
      </View>

      {/* Controls row */}
      <View style={styles.controlsRow}>
        {/* Dots */}
        {showDots ? renderDots() : <View />}

        {/* Counter */}
        <Text style={styles.counter}>
          {activeIndex + 1} / {totalSlides}
        </Text>

        {/* Arrows */}
        {showArrows && (
          <View style={styles.arrowsRow}>
            <ArrowButton
              direction="prev"
              onPress={() => goTo(activeIndex - 1)}
              disabled={!loop && activeIndex === 0}
            />
            <ArrowButton
              direction="next"
              onPress={() => goTo(activeIndex + 1)}
              disabled={!loop && activeIndex === totalSlides - 1}
            />
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingHorizontal: 16,
  },

  // Slide
  slide: {
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  captionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 18,
    background: 'transparent', // gradient handled via ImageBackground on RN 0.73+
    // Fallback semi-transparent bottom bar
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  captionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captionSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  counter: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 0.5,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ccc',
    margin: 3,
  },
  dotActive: {
    backgroundColor: '#1a1a1a',
    transform: [{ scale: 1.3 }],
  },

  // Arrows
  arrowsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 22,
    lineHeight: 26,
    color: '#1a1a1a',
    fontWeight: '300',
  },
  arrowTextDisabled: {
    color: '#aaa',
  },
});

export default ImageCarousel;