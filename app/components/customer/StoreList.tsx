// ===============================================
// STORE LIST COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import StoreCard from './StoreCard';

interface Store {
  id: number;
  name: string;
  rating: string;
  deliveryTime: string;
  location: string;
  logo: boolean;
  productImage: string | null;
}

interface StoreListProps {
  stores: Store[];
  onStorePress: (store: Store) => void;
  title?: string;
}

const StoreList: React.FC<StoreListProps> = ({ 
  stores, 
  onStorePress, 
  title = "Nearby Stores" 
}) => {
  const renderStoreItem = ({ item }: { item: Store }) => (
    <StoreCard store={item} onPress={onStorePress} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b090a',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  storesList: {
    paddingHorizontal: 16,
  },
});

export default StoreList;