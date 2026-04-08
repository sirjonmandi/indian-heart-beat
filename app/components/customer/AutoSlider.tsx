import React , { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native';

import { Colors } from '@/styles/colors';

interface AutoSliderProps {
  brands: any;
  onBrandPress: (item:any) => void;
}
const AutoSlider: React.FC<AutoSliderProps> = ({
  brands,
  onBrandPress,
}) =>{

    const flatListRef = useRef<FlatList>(null);

    const { width } = Dimensions.get('window');
    const [currentIndex, setCurrentIndex] = useState(0);

    // AUTO SLIDE
    useEffect(() => {
        const interval = setInterval(() => {
        let nextIndex = currentIndex + 1;

        if (nextIndex >= brands.length) {
            nextIndex = 0; // loop
        }

        flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
        });

        setCurrentIndex(nextIndex);
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [currentIndex]);

    const getInitials = (text = '') => {
        return text
            .trim()
            .split(/\s+/)
            .slice(0, 3) // 👈 limit to first 3 words
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    };

    const getColorFromName = (name:string) => {
        const colors = ['#FF5733', '#33B5FF', '#FF33A8', '#2fb40e', '#FFC300', '#8E44AD'];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    // const renderItem = ({ item }) => (
    //     <Image
    //     source={{ uri: item.image }}
    //     style={{ width, height: 200 }}
    //     resizeMode="contain"
    //     />
    // );

    const renderItem = ({ item, index }: { item : any; index: number }) => {
    const isLogo = false;

    return (
        <TouchableOpacity
        style={styles.sliderCard}
        onPress={() => onBrandPress(item)}
        >
        <View style={styles.categoryImageContainer}>
            {isLogo ? (
            <View style={[styles.logoContainer,{backgroundColor: '#2C2C2C'}]}>
                {/* <Text style={styles.logoText}>Maharaj Enterprise</Text> */}
                <Image source={require('../../../assets/images/app_logo.png')} style={{height:60, width:60, borderRadius:8}} />
            </View>
            ) : (
            <View style={styles.productImageContainer}>
                {item.logo ? (
                    <Image source={{uri:item.logo}} style={{height:70, width:70}} resizeMode="cover"/>
                ) : (
                    <View>
                        <View style={[styles.logoContainer,{backgroundColor: getColorFromName(item.name),}]}>
                            <Text style={styles.logoText}>{getInitials(item.name)}</Text>
                        </View>
                    </View>
                )}
            </View>
            )}
        </View>
        <Text style={styles.brandName}>{item.name}</Text>
        </TouchableOpacity>
    );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Shop By Brand</Text>
            <FlatList
                // ref={flatListRef}
                data={brands}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                style={{marginHorizontal:16}}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
            />

            {/* <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                {brands.map((_, index) => (
                    <View
                    key={index}
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 4,
                        backgroundColor: currentIndex === index ? '#0066a1' : '#ccc',
                    }}
                    />
                ))}
            </View> */}

        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        // backgroundColor: Colors.background,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textColor,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sliderCard: {
        flex: 1,
        margin: 4,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        width:140,
        maxWidth:140,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    productImageContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textWhite,
        textAlign: 'center',
    },
});

export default AutoSlider;
