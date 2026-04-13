// ===============================================
// INFO SECTIONS COMPONENT
// ===============================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { resetOrderType, resetScheduled } from '../../store/slices/cartSlice';
import { useDispatch } from 'react-redux';
import { Colors } from '@/styles/colors';
interface TimeSlot {
  id: string;
  displayText: string;
  startTime: string;
  endTime: string;
  startHour: number;
  startMinute: number;
  scheduledAt: string; // MySQL DATETIME format: "YYYY-MM-DD HH:MM:SS"
}

interface InfoSectionsProps {
  deliverySlot?: string;
  onChangeDeliverySlot: (slot: TimeSlot) => void;
  onChangeAddress?: () => void;
  selectedAddress?: any;
}

const InfoSections: React.FC<InfoSectionsProps> = ({ 
  deliverySlot = 'Instant',
  onChangeDeliverySlot, 
  onChangeAddress,
  selectedAddress
}) => {
  const dispatch = useDispatch();
  const [deliveryModel, setDeliveryModel] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(deliverySlot);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    const slots = generateTimeSlots(21, 30);
    setTimeSlots(slots);
  }, []);

  const handleChangeDeliverySlot = (slot: TimeSlot) => {
    setSelectedSlot(slot.displayText);
    setDeliveryModel(false);
    onChangeDeliverySlot(slot);
  };

  const handleChangeDeliverySlotPress = () => {
    setDeliveryModel(true);
  };

  const generateTimeSlots = (endHour: number, interval: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    let start = new Date();
    start.setHours(start.getHours() + 2, 0, 0, 0);

    const end = new Date();
    end.setHours(endHour, 0, 0, 0);

    let slotId = 0;

    // Helper function to format date to MySQL DATETIME
    const formatMySQLDateTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    while (start < end) {
      const from = new Date(start);
      const startHour = from.getHours();
      const startMinute = from.getMinutes();
      
      start.setMinutes(start.getMinutes() + interval);
      const to = new Date(start);

      const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

      const startTimeString = formatTime(from);
      const endTimeString = formatTime(to);
      const displayText = `${startTimeString} - ${endTimeString}`;

      slots.push({
        id: `slot-${slotId++}`,
        displayText,
        startTime: startTimeString,
        endTime: endTimeString,
        startHour,
        startMinute,
        scheduledAt: formatMySQLDateTime(from), // MySQL DATETIME format
      });
    }

    return slots;
  };

  const resetToInstant = () =>{
    console.log('reset to instant');
    setSelectedSlot(deliverySlot);
    dispatch(resetOrderType());
    dispatch(resetScheduled());
    setDeliveryModel(false);
  }

  return (
    <View style={styles.container}>
      {/* Delivery Slot change */}
      {/* <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Delivery By</Text>
        <View style={styles.deliveryRow}>
          <Icon name="schedule" size={16} color="#4CAF50" />
          <Text style={styles.deliveryText}>
            Delivery By <Text style={styles.deliveryTime}>{selectedSlot}</Text>
          </Text>
          <TouchableOpacity onPress={handleChangeDeliverySlotPress}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Legal Drinking Age Compliance */}
      {/* <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Legal Drinking Age Compliance</Text>
        <View style={styles.complianceRow}>
          <Icon name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.complianceText}>
            I am above 21 years. I consent that I am not 
            purchasing this for a minor and not in any dry
            state or where it's not on sale.
          </Text>
        </View>
      </View> */}
      
      {/* Delivery to Home */}
      {selectedAddress && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Delivery to Home</Text>
          <View style={styles.deliveryRow}>
            <Icon
              name={selectedAddress.type === 'home' ? 'home' : (selectedAddress.type === 'office' ? 'work' : 'location-on')}
              size={16}
              color={'#2196F3'}
            />
            <Text style={styles.deliveryText}>
              {selectedAddress.addressLine1}
            </Text>
            <TouchableOpacity onPress={onChangeAddress}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* <Modal visible={deliveryModel} animationType="fade" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setDeliveryModel(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Change Delivery Slot</Text>
                  <FlatList
                    data={timeSlots}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ alignItems: "center" }}
                    style={styles.slotList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.slot,
                          selectedSlot === item.displayText && styles.selectedSlot,
                        ]}
                        onPress={() => handleChangeDeliverySlot(item)}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            selectedSlot === item.displayText && styles.selectedText,
                          ]}
                        >
                          {item.displayText}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  <View style={{alignItems:'center'}}>
                    <TouchableOpacity style={styles.slot} onPress={resetToInstant}>
                      <Text style={styles.modalCloseText}>Instant</Text>
                    </TouchableOpacity>
                  </View>
                    <TouchableOpacity onPress={() => setDeliveryModel(false)}>
                      <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}

      {/* Cancellation Policy */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Cancellation Policy</Text>
        <View style={styles.policyRow}>
          <Icon name="info" size={16} color={Colors.error} />
          <Text style={styles.policyText}>
            Orders cannot be cancelled once placed!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  infoSection: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    marginBottom: 8,
    // borderRadius: 8,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: '#EFEFEF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  complianceText: {
    fontSize: 12,
    color: Colors.black,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyText: {
    fontSize: 12,
    color: Colors.black,
    marginLeft: 8,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: Colors.black,
    marginLeft: 8,
    flex: 1,
  },
  changeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deliveryTime: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'right',
  },
  slotList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  slot: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 10,
    marginBottom: 10,
    width: 200,
    alignItems: "center",
  },
  selectedSlot: {
    backgroundColor: "#4CAF50",
    borderColor: 'white',
  },
  slotText: { 
    fontSize: 14, 
    color: "#666" 
  },
  selectedText: { 
    color: "white", 
    fontWeight: "bold" 
  },
});

export default InfoSections;