// components/common/SimpleLocationPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import Button from './Button';

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
  label?: string;
  error?: string;
}

const SimpleLocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  label = "Shop Location",
  error
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tempLat, setTempLat] = useState(latitude);
  const [tempLng, setTempLng] = useState(longitude);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const latStr = lat.toFixed(6);
          const lngStr = lng.toFixed(6);
          setTempLat(latStr);
          setTempLng(lngStr);
          onLocationChange(latStr, lngStr);
          Alert.alert('Success', 'Current location obtained successfully!');
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert(
            'Location Error', 
            'Could not get current location. Please enter coordinates manually or use the map options below.',
            [{ text: 'OK' }]
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      Alert.alert('Error', 'Geolocation is not supported by this device.');
    }
  };

  const openGoogleMaps = () => {
    const defaultLat = latitude || '28.6139'; // Delhi coordinates as default
    const defaultLng = longitude || '77.2090';
    const url = `https://www.google.com/maps/@${defaultLat},${defaultLng},17z`;
    
    Alert.alert(
      'Open Google Maps',
      'This will open Google Maps in your browser. You can:\n\n1. Search for your location\n2. Right-click on your shop location\n3. Copy the coordinates\n4. Come back and enter them manually',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Maps', 
          onPress: () => {
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'Could not open Google Maps');
            });
          }
        }
      ]
    );
  };

  const validateAndSave = () => {
    const lat = parseFloat(tempLat);
    const lng = parseFloat(tempLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90 degrees.');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180 degrees.');
      return;
    }
    
    onLocationChange(tempLat, tempLng);
    setShowModal(false);
    Alert.alert('Success', 'Location coordinates saved successfully!');
  };

  const handleCancel = () => {
    setTempLat(latitude);
    setTempLng(longitude);
    setShowModal(false);
  };

  const displayLocation = () => {
    if (latitude && longitude) {
      return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`;
    }
    return 'No location selected';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity
        style={[
          styles.locationButton,
          error && styles.locationButtonError
        ]}
        onPress={() => setShowModal(true)}
      >
        <Icon name="location-on" size={20} color={Colors.primary} />
        <Text style={styles.locationText}>
          {displayLocation()}
        </Text>
        <Icon name="edit" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Location</Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              <Button
                title="Use Current Location"
                onPress={getCurrentLocation}
                style={styles.getCurrentLocationButton}
                icon="my-location"
              />

              <Text style={styles.sectionTitle}>Or Open Maps</Text>
              <Button
                title="Open Google Maps"
                onPress={openGoogleMaps}
                style={styles.openMapsButton}
                variant="outline"
                icon="map"
              />

              <Text style={styles.sectionTitle}>Manual Entry</Text>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={tempLat}
                onChangeText={setTempLat}
                placeholder="e.g., 28.6139"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={tempLng}
                onChangeText={setTempLng}
                placeholder="e.g., 77.2090"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                style={[styles.footerButton, styles.cancelButton]}
                variant="outline"
              />
              <Button
                title="Save"
                onPress={validateAndSave}
                style={[styles.footerButton, styles.saveButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    minHeight: 50,
  },
  locationButtonError: {
    borderColor: Colors.error,
  },
  locationText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  getCurrentLocationButton: {
    marginBottom: Spacing.md,
  },
  openMapsButton: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  cancelButton: {
    marginRight: Spacing.sm,
  },
  saveButton: {
    marginLeft: Spacing.sm,
  },
});

export default SimpleLocationPicker;