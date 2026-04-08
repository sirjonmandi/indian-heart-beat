import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const WalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const [walletBalance, setWalletBalance] = useState(1250.50);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const transactions = [
    {
      id: 1,
      type: 'credit',
      title: 'Money Added',
      description: 'Added via UPI',
      amount: 500,
      date: '15 Dec 2023, 2:30 PM',
      status: 'completed'
    },
    {
      id: 2,
      type: 'debit',
      title: 'Order Payment',
      description: 'Order #BG1234567890',
      amount: -249,
      date: '14 Dec 2023, 8:45 PM',
      status: 'completed'
    },
    {
      id: 3,
      type: 'credit',
      title: 'Cashback',
      description: 'First order cashback',
      amount: 50,
      date: '14 Dec 2023, 8:50 PM',
      status: 'completed'
    },
    {
      id: 4,
      type: 'credit',
      title: 'Referral Bonus',
      description: 'Friend joined via your link',
      amount: 100,
      date: '13 Dec 2023, 4:20 PM',
      status: 'completed'
    },
    {
      id: 5,
      type: 'debit',
      title: 'Order Payment',
      description: 'Order #BG1234567889',
      amount: -1200,
      date: '12 Dec 2023, 7:15 PM',
      status: 'completed'
    }
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000];

  const addMoneyToWallet = () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount < 10) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₹10)');
      return;
    }

    // Here you would integrate with payment gateway
    Alert.alert(
      'Add Money',
      `Add ₹${amount} to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            setWalletBalance(prev => prev + amount);
            setShowAddMoney(false);
            setAddAmount('');
            Alert.alert('Success', `₹${amount} added to your wallet!`);
          }
        }
      ]
    );
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        item.type === 'credit' ? styles.creditIcon : styles.debitIcon
      ]}>
        <Icon
          name={item.type === 'credit' ? 'add' : 'remove'}
          size={20}
          color="#FFFFFF"
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      
      <Text style={[
        styles.transactionAmount,
        item.type === 'credit' ? styles.creditAmount : styles.debitAmount
      ]}>
        {item.type === 'credit' ? '+' : ''}₹{Math.abs(item.amount)}
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
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity>
          <Icon name="help-outline" size={24} color="#2C2C2C" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Wallet Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              <Icon name="account-balance-wallet" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.balanceAmount}>₹{walletBalance.toFixed(2)}</Text>
            
            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={() => setShowAddMoney(true)}
            >
              <Icon name="add" size={16} color="#4CAF50" />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Icon name="payment" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Pay Bills</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Icon name="swap-horiz" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Icon name="history" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Icon name="redeem" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoney}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setShowAddMoney(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.currentBalance}>
              Current Balance: ₹{walletBalance.toFixed(2)}
            </Text>

            <View style={styles.amountInput}>
              <Text style={styles.inputLabel}>Enter Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="₹0"
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.quickAmounts}>
              <Text style={styles.quickAmountsLabel}>Quick Add</Text>
              <View style={styles.quickAmountButtons}>
                {quickAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => setAddAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountButtonText}>₹{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.proceedButton}
              onPress={addMoneyToWallet}
            >
              <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WalletScreen;