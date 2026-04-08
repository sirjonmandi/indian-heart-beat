    import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const ReferralScreen: React.FC = () => {
  const navigation = useNavigation();
  const [referralCode] = useState('BEER123');
  const [totalReferrals] = useState(8);
  const [totalEarnings] = useState(800);

  const referralHistory = [
    {
      id: 1,
      friendName: 'Amit Sharma',
      joinedDate: '15 Dec 2023',
      status: 'completed',
      earning: 100
    },
    {
      id: 2,
      friendName: 'Priya Singh',
      joinedDate: '12 Dec 2023',
      status: 'completed',
      earning: 100
    },
    {
      id: 3,
      friendName: 'Raj Kumar',
      joinedDate: '10 Dec 2023',
      status: 'pending',
      earning: 100
    },
    {
      id: 4,
      friendName: 'Sneha Patel',
      joinedDate: '8 Dec 2023',
      status: 'completed',
      earning: 100
    }
  ];

  const shareReferralCode = async () => {
    try {
      const message = `🍺 Join BeerGo and get alcohol delivered in 10 minutes!\n\nUse my referral code: ${referralCode}\n\nGet ₹100 bonus on your first order!\n\nDownload now: https://beergo.app/download`;
      
      await Share.share({
        message,
        title: 'Join BeerGo with my referral code!'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share referral code');
    }
  };

  const copyReferralCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const renderReferralItem = ({ item }: { item: any }) => (
    <View style={styles.referralItem}>
      <View style={styles.referralIcon}>
        <Icon name="person" size={24} color="#4CAF50" />
      </View>
      
      <View style={styles.referralDetails}>
        <Text style={styles.friendName}>{item.friendName}</Text>
        <Text style={styles.joinDate}>Joined on {item.joinedDate}</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            item.status === 'completed' ? styles.completedBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'completed' ? styles.completedText : styles.pendingText
            ]}>
              {item.status === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[
        styles.earningAmount,
        item.status === 'completed' ? styles.earnedAmount : styles.pendingAmount
      ]}>
        ₹{item.earning}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2C2C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Earnings Summary */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.summaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.summaryTitle}>Your Referral Earnings</Text>
            <Text style={styles.totalEarnings}>₹{totalEarnings}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalReferrals}</Text>
                <Text style={styles.statLabel}>Friends Joined</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>₹{totalEarnings / totalReferrals}</Text>
                <Text style={styles.statLabel}>Per Referral</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Share your referral code with friends</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Friend signs up and places first order</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>You both get ₹100 bonus!</Text>
            </View>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.referralCodeCard}>
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
          
          <View style={styles.codeContainer}>
            <Text style={styles.referralCodeText}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
              <Icon name="content-copy" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareReferralCode}>
            <Icon name="share" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Referral History */}
        <View style={styles.historyCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Referral History</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {referralHistory.length > 0 ? (
            <FlatList
              data={referralHistory}
              renderItem={renderReferralItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={64} color="#999" />
              <Text style={styles.emptyTitle}>No Referrals Yet</Text>
              <Text style={styles.emptyMessage}>
                Start sharing your code to earn rewards!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferralScreen;