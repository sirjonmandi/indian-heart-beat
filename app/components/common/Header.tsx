import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../styles/colors';
import { Typography} from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showCart?: boolean;
  cartCount?: number;
  onBackPress?: () => void;
  onCartPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showCart = false,
  cartCount = 0,
  onBackPress,
  onCartPress,
  backgroundColor = Colors.primary,
  textColor = Colors.white,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                <Icon name="arrow-back" size={24} color={textColor} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          </View>
          
          <View style={styles.rightSection}>
            {showCart && (
              <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
                <Icon name="shopping-cart" size={24} color={textColor} />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartCount > 99 ? '99+' : cartCount.toString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  safeArea: {
    paddingTop: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default Header;