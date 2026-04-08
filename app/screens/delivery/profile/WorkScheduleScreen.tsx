import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { fetchSchedule, fetchScheduleByDate, updateSchedule } from '@/store/slices/deliverySlice';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
interface RootState {
  delivery: {
    schedules:any;
    selectedDateSchedules:any;
  };
}

const WorkScheduleScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { schedules:dynamicSchedules, selectedDateSchedules:dynamicSelectedSchedules } = useSelector((state:RootState) => state.delivery);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [removeId, setRemoveId] = useState<number[]>([]);
  const [newSchedules, setNewSchedules] = useState({});
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing,setRefreshing] = useState(false);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState();

  const handleRemove = (id: number) => {
    setRemoveId(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const timeSlots = [
    { label: 'Early Morning', time: '06:00 AM - 09:00 AM', start: '06:00 AM', end: '09:00 AM', icon: '🌅' },
    { label: 'Morning', time: '09:00 AM - 12:00 PM', start: '09:00 AM', end: '12:00 PM', icon: '☀️' },
    { label: 'Afternoon', time: '12:00 PM - 03:00 PM', start: '12:00 PM', end: '03:00 PM', icon: '🌤️' },
    { label: 'Late Afternoon', time: '03:00 PM - 06:00 PM', start: '03:00 PM', end: '06:00 PM', icon: '🌆' },
    { label: 'Evening', time: '06:00 PM - 09:00 PM', start: '06:00 PM', end: '09:00 PM', icon: '🌙' },
    { label: 'Night', time: '09:00 PM - 11:59 PM', start: '09:00 PM', end: '11:59 PM', icon: '🌃' },
  ];

  useEffect(()=>{
    try {
      dispatch(fetchSchedule() as any).unwrap();
    } catch (error:any) {
      console.error(JSON.stringify(error,null,2));
    }
  },[]);

  useEffect(()=>{
    setSchedules(dynamicSchedules);
  },[dynamicSchedules])

  useEffect(()=>{
    try {
      dispatch(fetchScheduleByDate(formatDateKey(selectedDate)) as any).unwrap();
    } catch (error:any) {
      console.error(JSON.stringify(error,null,2));
    }
  },[selectedDate]);

  useEffect(()=>{
    setSelectedDateSchedules(dynamicSelectedSchedules);
  },[dynamicSelectedSchedules]);

  const handleRefresh = () =>{
    setRefreshing(true);
    try {
      dispatch(fetchSchedule() as any).unwrap();
      // Reset to current date on refresh
      setSelectedDate(new Date());
      setCurrentMonth(new Date());
    } catch (error:any) {
      
    } finally {
      setRefreshing(false);
    }
  } 
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const toggleSlot = (slotId) => {
    const dateKey = formatDateKey(selectedDate);
    if (schedules[dateKey]) {
      setSchedules({
        ...schedules,
        [dateKey]: schedules[dateKey].map((slot) =>
          slot.id === slotId ? { ...slot, enabled: !slot.enabled } : slot
        ),
      });
    }
  };

  const addTimeSlot = (start, end) => {
    const dateKey = formatDateKey(selectedDate);
    const currentSlots = schedules[dateKey] || [];
    
    // Check if a slot with the same start and end time already exists
    const isDuplicate = currentSlots.some(
      (slot) => slot.start === start && slot.end === end
    );
    
    if (isDuplicate) {
      Alert.alert(
        'Duplicate Time Slot',
        'This time slot already exists for the selected date.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const newSlot = {
      id: Date.now(),
      start: start || '09:00 AM',
      end: end || '12:00 PM',
      enabled: true,
      deletable:true,
    };
    
    setSchedules({
      ...schedules,
      [dateKey]: schedules[dateKey] ? [...schedules[dateKey], newSlot] : [newSlot],
    });

    setNewSchedules({
      ...newSchedules,
      [dateKey]: newSchedules[dateKey] ? [...newSchedules[dateKey], newSlot] : [newSlot],
    });

    setSelectedDateSchedules(prev => {
      if (prev && prev.length > 0) {
        return [...prev, newSlot];
      }
      return [newSlot];
    });
  };

  const removeTimeSlot = (slotId) => {
    Alert.alert(
      'Remove Time Slot',
      'Are you sure you want to remove this time slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const dateKey = formatDateKey(selectedDate);
            try {

              // setSchedules({
              //   ...schedules,
              //   [dateKey]: schedules[dateKey].filter((slot) => slot.id !== slotId),
              // });
              
              setSelectedDateSchedules(prev =>
                prev.filter(slot => slot.id !== slotId)
              );

              handleRemove(slotId);

              // setNewSchedules({
              //   ...newSchedules,
              //   [dateKey]: newSchedules[dateKey].filter((slot) => slot.id !== slotId),
              // });

            } catch (error) {
              console.log('====================================');
              console.log(JSON.stringify(error,null,2));
              console.log('====================================');
              console.log("faild to remove new sechedule ");
            }
          },
        },
      ]
    );
  };

  const getTotalScheduledDays = () => {
    if (!schedules) {
      return 0;
    }
    return Object.keys(schedules).filter(
      (dateKey) => schedules[dateKey].some((slot) => slot.enabled)
    ).length;
  };

  const getTotalWorkingHours = () => {
    let total = 0;
    schedules && Object.keys(schedules).forEach((dateKey) => {
      schedules[dateKey].forEach((slot) => {
        if (slot.enabled) {
          total += 3; // Simplified calculation
        }
      });
    });
    return total;
  };

  const hasSchedule = (date) => {
    if (!date) return false;
    const dateKey = formatDateKey(date);
    return schedules && schedules[dateKey] && schedules[dateKey].some((slot) => slot.enabled);
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getAllBookedSlots = () => {
    const bookedSlots = [];
    schedules && Object.keys(schedules).forEach((dateKey) => {
      const [year, month, day] = dateKey.split('-');
      const date = new Date(year, month - 1, day);
      schedules[dateKey].forEach((slot) => {
        if (slot.enabled) {
          bookedSlots.push({
            date: date,
            dateKey: dateKey,
            slot: slot,
            dateString: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            }),
            dayString: date.toLocaleDateString('en-US', { weekday: 'short' }),
          });
        }
      });
    });
    return bookedSlots.sort((a, b) => a.date - b.date);
  };

  const handleSaveSchedule = async() => {
    // Alert.alert('Success', 'Your work schedule has been updated successfully');
    const isNewSchedulesEmpty = Object.keys(newSchedules).length === 0;

    if (isNewSchedulesEmpty && removeId.length === 0) {
      Alert.alert(
        'Validation Error',
        'Nothing To Save, Please Make Changes Before Save.'
      );
      return;
    }
    setLoading(true)
    try {
      console.log('====================================');
      console.log(JSON.stringify(newSchedules,null,2));
      console.log('====================================');
      await dispatch(updateSchedule({data:{schedules: newSchedules, removeIds: removeId}}) as any).unwrap();
      Alert.alert(
        'Success',
        'Your work schedule has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error:any) {
      const errors = error?.errors;
      let firstErrorMessage = error?.message || 'Something went wrong';

      if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0]; // "schedules"
        firstErrorMessage = errors[firstKey][0]; // message
      }

      console.log(firstErrorMessage);
      Alert.alert('Validation Failed', firstErrorMessage);
    } finally {
      setNewSchedules({});
      setSchedules(dynamicSchedules);
      setLoading(false);
    }
  };

  // const selectedDateKey = formatDateKey(selectedDate);
  // const selectedDateSchedules = schedules ?  schedules[selectedDateKey] : [];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Work Schedule</Text>
            <Text style={styles.partnerCode}>
              Select dates and set your availability
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📅</Text>
            <Text style={styles.summaryValue}>{getTotalScheduledDays()}</Text>
            <Text style={styles.summaryLabel}>Scheduled Days</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>⏱️</Text>
            <Text style={styles.summaryValue}>{getTotalWorkingHours()}h</Text>
            <Text style={styles.summaryLabel}>Total Hours</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.card}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
              <Text style={styles.monthButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Days of Week Header */}
          <View style={styles.daysOfWeekRow}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.dayOfWeekText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {getDaysInMonth(currentMonth).map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !date && styles.calendarDayEmpty,
                  date && isSameDay(date, selectedDate) && styles.calendarDaySelected,
                  date && hasSchedule(date) && !isSameDay(date, selectedDate) && styles.calendarDayWithSchedule,
                ]}
                onPress={() => date && setSelectedDate(date)}
                disabled={!date}
              >
                {date && (
                  <>
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSameDay(date, selectedDate) && styles.calendarDayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    {hasSchedule(date) && (
                      <View style={[
                        styles.scheduleCheckMark,
                        isSameDay(date, selectedDate) && styles.scheduleCheckMarkSelected
                      ]}>
                        <Text style={[
                          styles.checkMarkText,
                          isSameDay(date, selectedDate) && styles.checkMarkTextSelected
                        ]}>✓</Text>
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Date Schedule */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.cardSubtitle}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                {/* {selectedDateSchedules && Object.keys(selectedDateSchedules).length} */}
              </Text>
            </View>
            {/* <TouchableOpacity onPress={() => addTimeSlot()} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Slot</Text>
            </TouchableOpacity> */}
          </View>

          { selectedDateSchedules && Object.keys(selectedDateSchedules).length <= 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No time slots scheduled for this date</Text>
              {/* <TouchableOpacity onPress={() => addTimeSlot()} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Add Time Slot</Text>
              </TouchableOpacity> */}
            </View>
          ) : (
            selectedDateSchedules && Object.keys(selectedDateSchedules).length > 0 && selectedDateSchedules.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <View style={styles.slotInfo}>
                  <View style={styles.slotTimes}>
                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>Start</Text>
                      <Text style={styles.timeValue}>{slot.start}</Text>
                    </View>
                    <Text style={styles.timeSeparator}>→</Text>
                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>End</Text>
                      <Text style={styles.timeValue}>{slot.end}</Text>
                    </View>
                  </View>
                  {slot.deletable && (
                  <TouchableOpacity
                    style={[
                      styles.statusBadge,
                      slot.enabled ? styles.statusActive : styles.statusInactive,
                    ]}
                    onPress={() => toggleSlot(slot.id)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        slot.enabled
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {slot.enabled ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>
                  )}
                </View>
                {slot.deletable ? (
                  <TouchableOpacity
                    onPress={() => removeTimeSlot(slot.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteIcon}><Icon name='delete' size={24} color='#EF4444'/></Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      slot.enabled ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        slot.enabled
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {slot.enabled ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Quick Time Slots */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Add Time Slots</Text>
          <Text style={styles.cardSubtitle}>
            Tap to add to {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          {timeSlots.map((slot, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickSlotButton}
              onPress={() => addTimeSlot(slot.start, slot.end)}
            >
              <Text style={styles.quickSlotIcon}>{slot.icon}</Text>
              <View style={styles.quickSlotInfo}>
                <Text style={styles.quickSlotLabel}>{slot.label}</Text>
                <Text style={styles.quickSlotTime}>{slot.time}</Text>
              </View>
              <Text style={styles.arrow}>+</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Booked Slots */}
        {getAllBookedSlots().length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booked Slots</Text>
            <Text style={styles.cardSubtitle}>
              All your upcoming scheduled time slots
            </Text>
            {getAllBookedSlots().map((booking, index) => (
              <View key={`${booking.dateKey}-${booking.slot.id}`} style={styles.bookedSlotRow}>
                <View style={styles.bookedDateBadge}>
                  <Text style={styles.bookedDateDay}>{booking.date.getDate()}</Text>
                  <Text style={styles.bookedDateMonth}>
                    {booking.date.toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.bookedSlotInfo}>
                  <Text style={styles.bookedSlotDate}>
                    {booking.dateString} • {booking.dayString}
                  </Text>
                  <Text style={styles.bookedSlotTime}>
                    {booking.slot.start} - {booking.slot.end}
                  </Text>
                </View>
                <View style={styles.bookedStatusBadge}>
                  <Text style={styles.bookedStatusText}>Active</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSchedule}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Loading....' :'Save Schedule'}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          You can update your schedule anytime
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  profileHeader: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  partnerCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    position: 'relative',
  },
  calendarDayEmpty: {
    opacity: 0,
  },
  calendarDaySelected: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  calendarDayWithSchedule: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#1F2937',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scheduleCheckMark: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleCheckMarkSelected: {
    backgroundColor: '#FFFFFF',
  },
  checkMarkText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkMarkTextSelected: {
    color: '#2196F3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 10,
  },
  slotInfo: {
    flex: 1,
  },
  slotTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBox: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#10B981',
  },
  statusTextInactive: {
    color: '#EF4444',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickSlotIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  quickSlotInfo: {
    flex: 1,
  },
  quickSlotLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  quickSlotTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  bookedSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  bookedDateBadge: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookedDateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bookedDateMonth: {
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  bookedSlotInfo: {
    flex: 1,
  },
  bookedSlotDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  bookedSlotTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  bookedStatusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookedStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default WorkScheduleScreen;