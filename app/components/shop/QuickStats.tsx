import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StatItem {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

interface Props {
  stats: StatItem[];
}

const QuickStats: React.FC<Props> = ({ stats }) => {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <Icon name={stat.icon} size={24} color={stat.color} />
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};