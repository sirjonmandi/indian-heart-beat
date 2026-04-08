import React, { useState } from 'react';
import { sendFeedback } from '@/store/slices/deliverySlice';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleSubmit = async() => {
    if (feedback.trim() === '') {
      Alert.alert('Required', 'Please provide feedback');
      return;
    }
    try {
      setLoading(true);
      await dispatch(sendFeedback({data: {message:feedback} }) as any).unwrap();
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setFeedback('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error:any) {
      console.log(JSON.stringify(error.errors.message,null,2) + 'error');
      Alert.alert('validation Failed', error.errors.message[0]);
    } finally {
      setLoading(false)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Feedback</Text>
                <Text style={styles.partnerCode}>
                We value your feedback to improve our services
                </Text>
            </View>
        </View>

        {/* Feedback Card */}
        <View style={styles.card}>
          {/* Feedback Text Area */}
          <View style={styles.section}>
            <Text style={styles.label}>Tell us more (optional)</Text>
            <TextInput
              style={styles.textArea}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Share your thoughts, suggestions, or concerns..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{feedback.length}/500 characters</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{loading ? 'Loading....' :'Submit Feedback'}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footer}>Your feedback helps us serve you better</Text>
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
    // padding: 20,
    // paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 40,
    color: '#D1D5DB',
  },
  starFilled: {
    color: '#FBBF24',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});