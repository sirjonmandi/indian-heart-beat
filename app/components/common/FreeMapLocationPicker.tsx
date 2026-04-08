import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Linking
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import Button from './Button';

interface FreeMapLocationPickerProps {
  mapTitle?: string;
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
  label?: string;
  error?: string;
}

const FreeMapLocationPicker: React.FC<FreeMapLocationPickerProps> = ({
  mapTitle = "Select Shop Location",
  latitude,
  longitude,
  onLocationChange,
  label = "Shop Location",
  error
}) => {
  const [showMap, setShowMap] = useState(false);
  const [tempLocation, setTempLocation] = useState({
    latitude: parseFloat(latitude) || 28.6139, // Default to Delhi
    longitude: parseFloat(longitude) || 77.2090,
  });
  const webViewRef = useRef<WebView>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // HTML content for the map
  const mapHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Location Picker</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map {
            height: 100vh;
            width: 100vw;
        }
        .coordinate-display {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: center;
            font-size: 14px;
            font-weight: 500;
        }
        .instructions {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            font-size: 14px;
            z-index: 1000;
        }
        .marker-popup {
            text-align: center;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="coordinate-display" id="coordinates">
        Click on the map to select location
    </div>
    
    <div id="map"></div>
    
    <div class="instructions">
        📍 Tap anywhere on the map to set your location
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Initialize map
        const initialLat = ${tempLocation.latitude};
        const initialLng = ${tempLocation.longitude};
        
        const map = L.map('map').setView([initialLat, initialLng], 15);
        
        // Add OpenStreetMap tiles (completely free!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Custom marker icon
        const customIcon = L.divIcon({
            html: '<div style="background: #007AFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            className: 'custom-marker'
        });
        
        // Initial marker
        let marker = L.marker([initialLat, initialLng], { 
            icon: customIcon,
            draggable: true 
        }).addTo(map);
        
        // Update coordinates display
        function updateCoordinates(lat, lng) {
            const coordElement = document.getElementById('coordinates');
            coordElement.innerHTML = \`📍 Lat: \${lat.toFixed(6)}, Lng: \${lng.toFixed(6)}\`;
            
            // Send coordinates to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location_update',
                latitude: lat,
                longitude: lng
            }));
        }
        
        // Initial coordinate display
        updateCoordinates(initialLat, initialLng);
        
        // Handle map clicks
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Remove existing marker
            if (marker) {
                map.removeLayer(marker);
            }
            
            // Add new marker
            marker = L.marker([lat, lng], { 
                icon: customIcon,
                draggable: true 
            }).addTo(map);
            
            // Add popup
            marker.bindPopup(\`
                <div class="marker-popup">
                    <strong>Your Shop Location</strong><br>
                    Lat: \${lat.toFixed(6)}<br>
                    Lng: \${lng.toFixed(6)}
                </div>
            \`).openPopup();
            
            // Update coordinates
            updateCoordinates(lat, lng);
            
            // Handle marker drag
            marker.on('dragend', function(e) {
                const newLat = e.target.getLatLng().lat;
                const newLng = e.target.getLatLng().lng;
                updateCoordinates(newLat, newLng);
                
                // Update popup
                marker.setPopupContent(\`
                    <div class="marker-popup">
                        <strong>Your Shop Location</strong><br>
                        Lat: \${newLat.toFixed(6)}<br>
                        Lng: \${newLng.toFixed(6)}
                    </div>
                \`);
            });
        });
        
        // Handle marker drag for initial marker
        marker.on('dragend', function(e) {
            const newLat = e.target.getLatLng().lat;
            const newLng = e.target.getLatLng().lng;
            updateCoordinates(newLat, newLng);
        });
        
        // Get current location with better error handling
        function getCurrentLocation() {
            // Check if geolocation is available
            if (!navigator.geolocation) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'location_error',
                    message: 'Geolocation is not supported by this device'
                }));
                return;
            }

            // Show loading state
            const coordElement = document.getElementById('coordinates');
            coordElement.innerHTML = '🔄 Getting your location...';
            
            // Request location with optimal settings
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    
                    console.log('Location found:', { lat, lng, accuracy });
                    
                    // Move map to current location with appropriate zoom
                    const zoomLevel = accuracy < 100 ? 17 : accuracy < 500 ? 15 : 13;
                    map.setView([lat, lng], zoomLevel);
                    
                    // Remove existing marker
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    
                    // Add new marker
                    marker = L.marker([lat, lng], { 
                        icon: customIcon,
                        draggable: true 
                    }).addTo(map);
                    
                    // Add popup with accuracy info
                    marker.bindPopup(\`
                        <div class="marker-popup">
                            <strong>📍 Current Location</strong><br>
                            Lat: \${lat.toFixed(6)}<br>
                            Lng: \${lng.toFixed(6)}<br>
                            <small>Accuracy: \${Math.round(accuracy)}m</small>
                        </div>
                    \`).openPopup();
                    
                    updateCoordinates(lat, lng);
                    
                    // Handle marker drag
                    marker.on('dragend', function(e) {
                        const newLat = e.target.getLatLng().lat;
                        const newLng = e.target.getLatLng().lng;
                        updateCoordinates(newLat, newLng);
                        
                        // Update popup
                        marker.setPopupContent(\`
                            <div class="marker-popup">
                                <strong>📍 Adjusted Location</strong><br>
                                Lat: \${newLat.toFixed(6)}<br>
                                Lng: \${newLng.toFixed(6)}
                            </div>
                        \`);
                    });
                    
                    // Notify React Native of success
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'location_success',
                        message: \`Location found with \${Math.round(accuracy)}m accuracy\`,
                        data: { lat, lng, accuracy }
                    }));
                },
                function(error) {
                    console.error('Geolocation error:', error);
                    
                    // Reset coordinate display
                    const coordElement = document.getElementById('coordinates');
                    coordElement.innerHTML = 'Click on the map to select location';
                    
                    let errorMessage = 'Could not get current location. ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out. Please try again.';
                            break;
                        default:
                            errorMessage += 'Please try again or select location manually.';
                            break;
                    }
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'location_error',
                        message: errorMessage,
                        error_code: error.code
                    }));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000, // Increased timeout
                    maximumAge: 60000 // Allow cached location for 1 minute
                }
            );
        }
        
        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            handleMessageFromRN(data);
        });
        
        // For Android
        if (window.ReactNativeWebView) {
            window.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                handleMessageFromRN(data);
            });
        }
        
        function handleMessageFromRN(data) {
            switch(data.type) {
                case 'get_current_location':
                    getCurrentLocation();
                    break;
                case 'set_location':
                    // Set location from React Native geolocation
                    const lat = data.latitude;
                    const lng = data.longitude;
                    
                    // Move map to location
                    map.setView([lat, lng], 16);
                    
                    // Remove existing marker
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    
                    // Add new marker
                    marker = L.marker([lat, lng], { 
                        icon: customIcon,
                        draggable: true 
                    }).addTo(map);
                    
                    marker.bindPopup(\`
                        <div class="marker-popup">
                            <strong>📍 Current Location</strong><br>
                            Lat: \${lat.toFixed(6)}<br>
                            Lng: \${lng.toFixed(6)}<br>
                            <small>From device GPS</small>
                        </div>
                    \`).openPopup();
                    
                    updateCoordinates(lat, lng);
                    
                    // Handle marker drag
                    marker.on('dragend', function(e) {
                        const newLat = e.target.getLatLng().lat;
                        const newLng = e.target.getLatLng().lng;
                        updateCoordinates(newLat, newLng);
                    });
                    break;
            }
        }
        
        // Search functionality (optional enhancement)
        function searchLocation(query) {
            // Using Nominatim API (free geocoding service)
            fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query)}&limit=1\`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const result = data[0];
                        const lat = parseFloat(result.lat);
                        const lng = parseFloat(result.lon);
                        
                        map.setView([lat, lng], 15);
                        
                        // Remove existing marker
                        if (marker) {
                            map.removeLayer(marker);
                        }
                        
                        // Add new marker
                        marker = L.marker([lat, lng], { 
                            icon: customIcon,
                            draggable: true 
                        }).addTo(map);
                        
                        marker.bindPopup(\`
                            <div class="marker-popup">
                                <strong>\${result.display_name}</strong><br>
                                Lat: \${lat.toFixed(6)}<br>
                                Lng: \${lng.toFixed(6)}
                            </div>
                        \`).openPopup();
                        
                        updateCoordinates(lat, lng);
                        
                        marker.on('dragend', function(e) {
                            const newLat = e.target.getLatLng().lat;
                            const newLng = e.target.getLatLng().lng;
                            updateCoordinates(newLat, newLng);
                        });
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                });
        }
    </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'location_update':
          setTempLocation({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          break;
          
        case 'location_success':
          Alert.alert('✅ Location Found', data.message, [
            { text: 'OK', style: 'default' }
          ]);
          break;
          
        case 'location_error':
          console.error('Location error:', data);
          
          if (data.error_code === 1) { // PERMISSION_DENIED
            Alert.alert(
              '📍 Location Permission Needed',
              'To use your current location, please:\n\n1. Enable location services in your device settings\n2. Allow location access for this app\n3. Try again',
              [
                { text: 'Skip', style: 'cancel' },
                { text: 'Try Again', onPress: getCurrentLocation }
              ]
            );
          } else if (data.error_code === 3) { // TIMEOUT
            Alert.alert(
              '⏱️ Location Timeout',
              'Location request took too long. This might happen if:\n\n• You\'re indoors\n• GPS signal is weak\n• Location services are disabled',
              [
                { text: 'Skip', style: 'cancel' },
                { text: 'Try Again', onPress: getCurrentLocation }
              ]
            );
          } else {
            Alert.alert(
              '❌ Location Error',
              data.message + '\n\nYou can still select your location by tapping on the map.',
              [{ text: 'OK' }]
            );
          }
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const getCurrentLocation = () => {
    // First check if we can get location through React Native
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // For mobile platforms, request permission first
      requestLocationPermission();
    } else {
      // For web platforms, use WebView geolocation
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'get_current_location'
        }));
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
      if(Platform.OS === 'android'){
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Location permission is Required',
            'Please go to Settings > Apps > Maharaj Enterprise > Permissions and enable Location access. To use this feature. ',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
      }

      Geolocation.getCurrentPosition((position)=>{
          const { latitude, longitude, accuracy } = position.coords;

          setTempLocation({latitude, longitude});

          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'set_location',
              latitude,
              longitude
            }));
          }
          // Alert.alert(
          //   'Location Found',
          //   `Lat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}\nAccuracy: ${Math.round(accuracy)}m`
          // );
      },
      (error)=>{
        console.error('Location error:', error);
        let message = 'Unable to get location. ';
        switch (error.code) {
          case 1: message += 'Permission denied.'; break;
          case 2: message += 'Position unavailable.'; break;
          case 3: message += 'Timeout.'; break;
          default: message += 'Unknown error.'; break;
        }
        Alert.alert('Location Error', message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => requestLocationPermission() }
        ]);
      });
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const confirmLocation = () => {
    onLocationChange(
      tempLocation.latitude.toString(),
      tempLocation.longitude.toString()
    );
    setShowMap(false);
    Alert.alert('Success', 'Location updated successfully!');
  };

  const renderMapModal = () => (
    <Modal
      visible={showMap}
      animationType="slide"
      onRequestClose={() => setShowMap(false)}
    >
      <View style={styles.mapModalContainer}>
        <View style={styles.mapHeader}>
          <TouchableOpacity
            style={styles.mapCloseButton}
            onPress={() => setShowMap(false)}
          >
            <Icon name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.mapTitle}>{mapTitle}</Text>
          <TouchableOpacity
            style={styles.mapConfirmButton}
            onPress={confirmLocation}
          >
            <Text style={styles.mapConfirmText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webView}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
        
        <View style={styles.mapFooter}>
          <Button
            title="📍 Use Current Location"
            onPress={getCurrentLocation}
            style={styles.currentLocationButton}
            variant="outline"
          />
          <View style={styles.coordinatesDisplay}>
            <Text style={styles.coordinatesText}>
              📍 {tempLocation.latitude.toFixed(6)}, {tempLocation.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.locationDisplayContainer}>
        <View style={styles.coordinatesPreview}>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Latitude:</Text>
            <Text style={styles.coordinateValue}>
              {latitude || 'Not set'}
            </Text>
          </View>
          <View style={styles.coordinateItem}>
            <Text style={styles.coordinateLabel}>Longitude:</Text>
            <Text style={styles.coordinateValue}>
              {longitude || 'Not set'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
        >
          <Icon name="map" size={20} color={Colors.white} />
          <Text style={styles.mapButtonText}>Select on Map</Text>
        </TouchableOpacity>
      </View>

      {latitude && longitude && (
        <View style={styles.statusContainer}>
          <Icon name="check-circle" size={16} color={Colors.success} />
          <Text style={styles.statusText}>Location coordinates set successfully</Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {renderMapModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  locationDisplayContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coordinatesPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  coordinateItem: {
    flex: 1,
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  coordinateValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  mapButtonText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: Colors.success + '10',
    padding: Spacing.sm,
    borderRadius: 6,
  },
  statusText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeight.medium,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },

  // Map Modal Styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapCloseButton: {
    padding: Spacing.sm,
  },
  mapTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  mapConfirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  mapConfirmText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.md,
  },
  webView: {
    flex: 1,
  },
  mapFooter: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  currentLocationButton: {
    marginBottom: Spacing.md,
    borderColor: Colors.success,
  },
  coordinatesDisplay: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    fontWeight: Typography.fontWeight.medium,
  },
});

export default FreeMapLocationPicker;