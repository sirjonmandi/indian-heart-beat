import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const supportOptions = [
    {
      id: 1,
      title: 'Call Support',
      description: 'Talk to our support team',
      icon: 'phone',
      action: () => Linking.openURL('tel:+919988776655')
    },
    {
      id: 2,
      title: 'WhatsApp Support',
      description: '24/7 chat support',
      icon: 'chat',
      action: () => Linking.openURL('https://wa.me/919988776655')
    },
    {
      id: 3,
      title: 'Email Support',
      description: 'Send us an email',
      icon: 'email',
      action: () => setShowContactForm(true)
    },
    {
      id: 4,
      title: 'Live Chat',
      description: 'Chat with our team',
      icon: 'forum',
      action: () => Alert.alert('Live Chat', 'Live chat will be available soon!')
    }
  ];

  const faqData = [
    {
      id: 1,
      question: 'What kind of products do you sell?',
      answer: 'Maharaj Enterprise specializes in industrial tools and equipment for a wide range of professional and commercial applications.'
    },
    {
      id: 2,
      question: 'How fast is the delivery?',
      answer: 'Delivery time depends on your location and product availability. You will receive tracking information after your order is dispatched.'
    },
    {
      id: 3,
      question: 'What payment methods do you accept?',
      answer: 'We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (where available).'
    },
    {
      id: 4,
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order within a specific window after placing it. Please contact our support team as soon as possible for cancellation requests.'
    },
    {
      id: 5,
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time from the Orders section. You will also receive SMS and push notifications with updates.'
    },
    {
      id: 6,
      question: 'What if I receive a damaged product?',
      answer: 'If you receive a damaged product, please contact our support immediately. We are committed to resolving any issues quickly and will replace it or provide a full refund.'
    },
    {
      id: 7,
      question: 'Do you offer customer support 24/7?',
      answer: 'Yes! Our professional and friendly customer care team is available 24/7 via phone or email to assist you with any questions or concerns.'
    },
    {
      id: 8,
      question: 'How can I share feedback or suggestions?',
      answer: 'We value your feedback! You can reach out to us via email at support@maharajenterprise.com or use the contact form in the app. We would love to hear from you.'
    }
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Order Issues',
      description: 'Problems with your order',
      icon: 'shopping-cart',
      color: '#FF9800'
    },
    {
      id: 2,
      title: 'Payment Issues',
      description: 'Payment and refund queries',
      icon: 'payment',
      color: '#2196F3'
    },
    {
      id: 3,
      title: 'Account Issues',
      description: 'Login and account problems',
      icon: 'account-circle',
      color: '#9C27B0'
    },
    {
      id: 4,
      title: 'App Issues',
      description: 'Technical problems',
      icon: 'bug-report',
      color: '#F44336'
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const submitContactForm = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert('Success', 'Your message has been sent. We will get back to you as soon as possible.', [
      {
        text: 'OK',
        onPress: () => {
          setShowContactForm(false);
          setContactForm({ subject: '', message: '' });
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>

        {/* Welcome Banner */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>We Are Happy to Help You 🙌</Text>
          <Text style={styles.welcomeText}>
            Welcome to Maharaj Enterprise's online store for industrial tools and equipment.
            Feel free to contact us with any questions, comments, or concerns — our professional
            and friendly customer care team is available <Text style={styles.bold}>24/7</Text> via
            phone or email to assist you.
          </Text>
        </View>

        {/* Quick Support Options */}
        <View style={styles.supportOptionsCard}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.supportGrid}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.supportOption}
                onPress={option.action}
              >
                <Icon name={option.icon} size={24} color="#4CAF50" />
                <Text style={styles.supportOptionTitle}>{option.title}</Text>
                <Text style={styles.supportOptionDesc}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Common Issues</Text>
          <View style={styles.quickActionsList}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickAction}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDesc}>{action.description}</Text>
                </View>
                <Icon name="arrow-forward-ios" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqCard}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Icon
                  name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfoCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.contactItem}>
            <Icon name="phone" size={20} color="#4CAF50" />
            <Text style={styles.contactText}>+91 99887 76655</Text>
          </View>

          <View style={styles.contactItem}>
            <Icon name="email" size={20} color="#4CAF50" />
            <Text style={styles.contactText}>support@maharajenterprise.com</Text>
          </View>

          <View style={styles.contactItem}>
            <Icon name="access-time" size={20} color="#4CAF50" />
            <Text style={styles.contactText}>24/7 Customer Support Available</Text>
          </View>

          <View style={styles.contactItem}>
            <Icon name="store" size={20} color="#4CAF50" />
            <Text style={styles.contactText}>Maharaj Enterprise — Industrial Tools & Equipment</Text>
          </View>
        </View>

        {/* Commitment Note */}
        <View style={styles.commitmentCard}>
          <Icon name="verified-user" size={28} color="#4CAF50" style={{ marginBottom: 8 }} />
          <Text style={styles.commitmentTitle}>Our Commitment to You</Text>
          <Text style={styles.commitmentText}>
            We understand that sometimes things can go wrong. We are committed to resolving any
            issues as quickly and efficiently as possible. At Maharaj Enterprise, transparency and
            communication with our clients are our top priorities. We want you to feel secure and
            at ease when shopping with us.
          </Text>
          <Text style={styles.commitmentText}>
            If you have any feedback or suggestions for how we can improve our service, we would
            love to hear from you. Thank you for choosing Shop Industrial Tools — we look forward
            to serving you!
          </Text>
        </View>

      </ScrollView>

      {/* Contact Form Modal */}
      <Modal
        visible={showContactForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Support</Text>
              <TouchableOpacity onPress={() => setShowContactForm(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Fill in the fields below and we'll get back to you as soon as possible.
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Brief description of your issue"
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your issue in detail"
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                  multiline
                  numberOfLines={5}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitContactForm}>
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  content: {},
  welcomeCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  supportOptionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  supportOption: {
    width: '48%',
    marginBottom: 12,
  },
  supportOptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  supportOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickActionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  quickActionsList: {
    flexDirection: 'column',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  quickActionIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActionDesc: {
    fontSize: 12,
    color: '#666',
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  faqItem: {
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  faqQuestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  contactInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flexShrink: 1,
  },
  commitmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
    padding: 16,
    elevation: 2,
    alignItems: 'center',
  },
  commitmentTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  commitmentText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  formContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HelpSupportScreen;