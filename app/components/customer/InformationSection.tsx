// ===============================================
// INFORMATION SECTION COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface InformationSectionProps {
  description?: string;
}

const InformationSection: React.FC<InformationSectionProps> = ({
  description = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum"
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Information</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    // marginTop: 8,
    margin:8,
    borderRadius:8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textWhite,
    lineHeight: 20,
  },
});

export default InformationSection;