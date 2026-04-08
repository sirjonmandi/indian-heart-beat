// ===============================================
// FIXED VIDEO PLAYER - WORKING CONTROLS
// ===============================================

import { Colors } from '@/styles/colors';
import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VideoPlayer from 'react-native-media-console';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductImageSectionProps {
  videoUri?: string;
  productType?: 'whiskey' | 'beer' | 'wine' | 'vodka';
  images?: string[];
}

// FIXED MyVideo component with working controls
const MyVideo = React.memo<{uri:string; navigation: any; posterSource?: any }>(
  ({uri, navigation, posterSource }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <View style={{ height: 250, width: '100%', position: 'relative' }}>
        <VideoPlayer
          source={{ uri }}
          navigator={navigation}
          resizeMode="cover"
          paused={!isPlaying}
          
          // ✅ Control behavior
          showOnStart={true}              // Show controls when video loads
          controlTimeout={3000}            // Hide controls after 3 seconds
          
          // ✅ Control visibility (false = SHOW, true = HIDE)
          disableFullscreen={false}        // ✅ SHOW fullscreen button
          disableVolume={false}            // ✅ SHOW volume slider
          disableSeekbar={false}           // ✅ SHOW progress bar
          disableTimer={false}             // ✅ SHOW time (0:00 / 3:45)
          disableBack={true}               // ❌ HIDE back button
          
          // Poster
          poster={posterSource}
          posterResizeMode="cover"
          
          // Styling
          seekColor="#FF6B35"
          
          // Callbacks
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Custom play button overlay (only shown when paused) */}
        {!isPlaying && (
          <TouchableOpacity
            style={styles.playButtonOverlay}
            onPress={() => setIsPlaying(true)}
            activeOpacity={0.8}
          >
            <View style={styles.playButton}>
              <Icon name="play-arrow" size={48} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.posterSource === nextProps.posterSource;
  }
);

MyVideo.displayName = 'MyVideo';

const ProductImageSection: React.FC<ProductImageSectionProps> = ({
  videoUri,
  productType = 'whiskey',
  images = [],
}) => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const hasImages = Array.isArray(images) && images.length > 0;
  const totalSlides = hasImages ? images.length + 1 : 2;
  const imageCount = hasImages ? images.length : 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const renderProductImage = () => {
    return (
      <View style={[styles.bottleContainer, {height:140 ,width: 140}]}>
        <Image source={require('../../../assets/images/app_logo.png')} style={styles.productImage} resizeMode="cover"/>
      </View>
    );
  };

  const memoizedVideo = useMemo(
    () => (
      <MyVideo 
        uri={videoUri}
        navigation={navigation}
        posterSource={require('../../../assets/images/home-bg.jpg')}
      />
    ),
    [navigation, videoUri]
  );

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {hasImages ? (
            images.map((imageUri, index) => (
              <View key={`image-${index}`} style={styles.imageSlide}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            ))
          ) : (
            <View key="fallback" style={styles.imageSlide}>
              <View style={styles.fallbackImageContainer}>
                {renderProductImage()}
              </View>
            </View>
          )}
          {videoUri ? (
            <View key="videoclip" style={styles.imageSlide}>
              {memoizedVideo}
            </View>
          ) : (
            <View key="videoclip" style={styles.imageSlide}>
              <Text>Video not Available</Text>
            </View>
          )}
        </ScrollView>

        {totalSlides > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.arrowButton, styles.arrowLeft]}
                onPress={handlePrevious}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {currentIndex < totalSlides - 1 && (
              <TouchableOpacity
                style={[styles.arrowButton, styles.arrowRight]}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Icon name="chevron-right" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </>
        )}

        {totalSlides > 1 && (
          <View style={styles.paginationContainer}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <TouchableOpacity
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
                onPress={() => scrollToIndex(index)}
                activeOpacity={0.7}
              />
            ))}
          </View>
        )}

        {totalSlides > 1 && (
          <View style={styles.counterContainer}>
            <View style={styles.counterBadge}>
              <Icon name="image" size={14} color="#FFFFFF" />
              <View style={styles.counterTextContainer}>
                <View style={styles.counterText}>
                  <View style={styles.currentIndexCircle}>
                    <View style={styles.currentIndexText} />
                  </View>
                  <View style={styles.counterSeparator} />
                  <View style={styles.totalCountText} />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    margin: 8,
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
  },
  sliderContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: 320,
  },
  scrollView: {
    width: SCREEN_WIDTH,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  fallbackImageContainer: {
    width: 200,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Navigation Arrows
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowLeft: {
    left: 24,
  },
  arrowRight: {
    right: 24,
  },

  // Pagination Dots
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },

  // Image Counter Badge
  counterContainer: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  counterTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentIndexCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentIndexText: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2C2C',
  },
  counterSeparator: {
    width: 8,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  totalCountText: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Fallback Product Images
  whiskeyContainer: {
    position: 'relative',
    width: 80,
    height: 280,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  whiskeyBottle: {
    width: 80,
    height: 260,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
  },
  whiskeyCapTop: {
    width: 30,
    height: 30,
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    position: 'absolute',
    top: 0,
  },
  whiskeyLabel: {
    width: 70,
    height: 60,
    backgroundColor: '#F5F5DC',
    borderRadius: 4,
    position: 'absolute',
    top: 80,
    zIndex: 1,
  },
  whiskeyLabelRed: {
    width: 60,
    height: 20,
    backgroundColor: '#DC143C',
    borderRadius: 2,
    position: 'absolute',
    top: 95,
    zIndex: 2,
  },
  beerContainer: {
    position: 'relative',
    width: 60,
    height: 280,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  beerBottle: {
    width: 60,
    height: 260,
    backgroundColor: '#8B4513',
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
  },
  beerLabel: {
    width: 50,
    height: 80,
    backgroundColor: '#228B22',
    borderRadius: 4,
    position: 'absolute',
    top: 90,
    zIndex: 1,
  },

  // Video Player Styles
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default ProductImageSection;