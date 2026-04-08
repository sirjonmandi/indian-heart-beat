import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface Props {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
}

const OnlineToggle: React.FC<Props> = ({ isOnline, onToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          You're {isOnline ? 'Online' : 'Offline'}
        </Text>
        <Switch
          value={isOnline}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={isOnline ? '#fff' : '#f4f3f4'}
        />
      </View>
      <Text style={styles.subtitle}>
        {isOnline 
          ? 'Ready to receive delivery requests' 
          : 'Go online to start receiving orders'
        }
      </Text>
    </View>
  );
};
