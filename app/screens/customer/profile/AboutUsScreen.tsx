import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';
import { Constants } from '@/utils/constants';

const { width } = Dimensions.get('window');

// ── Brand Tokens ──────────────────────────────────────────────
const C = {
  bg:        Colors.background,   // warm off-white, like uncoated paper
  surface:   Colors.background,
  card:      '#FFFFFF',
  border:    '#E2DDD6',
  accent:    Colors.primary,   // deep burnt-orange / industrial copper
  accentLt:  '#FFF0E6',
  steel:     '#6B7280',
  dark:      '#1C1A17',
  textPri:   Colors.textWhite,
  textSec:   '#5A5550',
  textMut:   '#9A9288',
  success:   '#2E6E42',
  successLt: '#EAF5EE',
  info:      '#1A5FA0',
  infoLt:    '#E8F2FC',
  danger:    Colors.primary,
  dangerLt:  '#FDEAEA',
};

// ── Data ──────────────────────────────────────────────────────
const companyStats = [
  { id: 1, number: '10+',   label: 'Years in Industry', icon: 'history'        },
  { id: 2, number: '5000+', label: 'Products Listed',   icon: 'inventory-2'    },
  { id: 3, number: '20K+',  label: 'Happy Customers',   icon: 'people'         },
  { id: 4, number: 'PAN',   label: 'India Delivery',    icon: 'local-shipping' },
];

const features = [
  { id: 1, title: 'Quality Assured',     description: 'Every product sourced from certified, reputable manufacturers', icon: 'verified',       color: C.success, lt: C.successLt },
  { id: 2, title: 'Competitive Price',   description: 'Best-in-market pricing with no hidden charges',                  icon: 'price-check',    color: C.accent,  lt: C.accentLt  },
  { id: 3, title: 'Fast Shipping',       description: 'Swift pan-India dispatch so your project never stops',           icon: 'local-shipping', color: C.info,    lt: C.infoLt    },
  { id: 4, title: '24/7 Expert Support', description: 'Knowledgeable team ready to help you pick the right tool',      icon: 'support-agent',  color: C.danger,  lt: C.dangerLt  },
];

const industries = [
  'Manufacturing', 'Construction', 'Automotive', 'Agriculture',
  'Mining', 'Electrical', 'Plumbing', 'Fabrication',
];

const contactItems = [
  { icon: 'location-on', label: 'Location', value: 'India (Pan-India Shipping)',       url: undefined },
  { icon: 'language',    label: 'Website',  value: 'maharajenterprise.com',            url: 'https://maharajenterprise.com'     },
  { icon: 'email',       label: 'Email',    value: 'support@maharajenterprise.com',        url: 'mailto:support@maharajenterprise.com' },
];

// ── Sub-components ────────────────────────────────────────────
const SectionLabel = ({ text }: { text: string }) => (
  <View style={s.sectionLabelRow}>
    <View style={s.sectionLabelBar} />
    <Text style={s.sectionLabel}>{text}</Text>
  </View>
);

const Divider = () => <View style={s.divider} />;

const StatCard = ({ stat }: { stat: typeof companyStats[0] }) => (
  <View style={s.statCard}>
    <View style={s.statIconBox}>
      <Icon name={stat.icon} size={20} color={C.accent} />
    </View>
    <Text style={s.statNumber}>{stat.number}</Text>
    <Text style={s.statLabel}>{stat.label}</Text>
  </View>
);

const FeatureRow = ({ feature }: { feature: typeof features[0] }) => (
  <View style={s.featureRow}>
    <View style={[s.featureIconBox, { backgroundColor: feature.lt }]}>
      <Icon name={feature.icon} size={20} color={feature.color} />
    </View>
    <View style={s.featureText}>
      <Text style={s.featureTitle}>{feature.title}</Text>
      <Text style={s.featureDesc}>{feature.description}</Text>
    </View>
  </View>
);

// ── Main Screen ───────────────────────────────────────────────
const AboutUsScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollY    = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const headerShadow = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 4], extrapolate: 'clamp' });

  const openURL = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link'));
  };

  return (
    <SafeAreaView style={s.container}>

      {/* ── Header ── */}
      <Animated.View style={[s.header, { elevation: headerShadow, shadowOpacity: headerShadow.interpolate({ inputRange: [0, 4], outputRange: [0, 0.08] }) }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>About Us</Text>
        <View style={{ width: 38 }} />
      </Animated.View>

      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >

        {/* ── Hero ── */}
        <LinearGradient colors={[Colors.background, Colors.background]} style={s.hero}>
          <View style={s.heroAccentStripe} />
          <View style={s.heroBadge}>
            <Icon name="build" size={11} color={C.accent} />
            <Text style={s.heroBadgeText}>INDUSTRIAL TOOLS SPECIALIST</Text>
          </View>
          <Text style={s.heroName}>Maharaj{'\n'}Enterprise</Text>
          <Text style={s.heroTagline}>Your Trusted Source for{'\n'}Top-Notch Industrial Tools</Text>
          <View style={s.heroMeta}>
            <Icon name="verified-user" size={13} color={C.accent} />
            <Text style={s.heroMetaText}>Serving industry professionals for 10+ years</Text>
          </View>
        </LinearGradient>

        {/* ── Stats ── */}
        <View style={s.section}>
          <SectionLabel text="BY THE NUMBERS" />
          <View style={s.statsGrid}>
            {companyStats.map(stat => <StatCard key={stat.id} stat={stat} />)}
          </View>
        </View>

        <Divider />

        {/* ── Who We Are ── */}
        <View style={s.section}>
          <SectionLabel text="WHO WE ARE" />
          <Text style={s.bodyText}>
            Maharaj Enterprise is a trustworthy online merchant delivering top-notch industrial tools and supplies across India. We source exclusively from certified, reputable manufacturers — ensuring every tool you purchase is built to last and perform at the highest level.
          </Text>
          <Text style={[s.bodyText, { marginTop: 12 }]}>
            Whether you're a professional contractor, a factory operator, or a passionate DIY enthusiast, we have the right tool for the job — at the best price, with fast delivery straight to your door.
          </Text>
        </View>

        <Divider />

        {/* ── Industries ── */}
        <View style={s.section}>
          <SectionLabel text="INDUSTRIES WE SERVE" />
          <View style={s.industryWrap}>
            {industries.map(ind => (
              <View key={ind} style={s.industryChip}>
                <Icon name="chevron-right" size={12} color={C.accent} />
                <Text style={s.industryChipText}>{ind}</Text>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* ── Mission & Vision ── */}
        <View style={s.section}>
          <SectionLabel text="MISSION & VISION" />

          <View style={s.mvCard}>
            <View style={s.mvCardBar} />
            <View style={s.mvCardInner}>
              <View style={s.mvIconRow}>
                <Icon name="flag" size={15} color={C.accent} />
                <Text style={s.mvCardTitle}>MISSION</Text>
              </View>
              <Text style={s.mvCardText}>
                To provide customers with the highest quality industrial tools and equipment while delivering exceptional service — making the purchasing process simple and stress-free.
              </Text>
            </View>
          </View>

          <View style={[s.mvCard, { marginTop: 12 }]}>
            <View style={[s.mvCardBar, { backgroundColor: C.info }]} />
            <View style={s.mvCardInner}>
              <View style={s.mvIconRow}>
                <Icon name="visibility" size={15} color={C.info} />
                <Text style={[s.mvCardTitle, { color: C.info }]}>VISION</Text>
              </View>
              <Text style={s.mvCardText}>
                To become India's most popular go-to source for all industrial equipment — offering the most diverse selection across every product category, serving all industries and trades.
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* ── Why Choose Us ── */}
        <View style={s.section}>
          <SectionLabel text="WHY CHOOSE US" />
          {features.map(f => <FeatureRow key={f.id} feature={f} />)}
        </View>

        <Divider />

        {/* ── Commitment ── */}
        <View style={s.section}>
          <SectionLabel text="OUR COMMITMENT" />
          <View style={s.commitCard}>
            <View style={s.commitTopBar} />
            <View style={s.commitInner}>
              <View style={s.commitIconCircle}>
                <Icon name="handshake" size={26} color={C.accent} />
              </View>
              <Text style={s.commitTitle}>Delivering the Best Solutions</Text>
              <Text style={s.commitText}>
                Quality, reliability, and durability are our cornerstones. We partner only with suppliers who share our dedication to excellence — backing every order with expert support and fast, reliable shipping.
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* ── Contact ── */}
        <View style={s.section}>
          <SectionLabel text="GET IN TOUCH" />
          <View style={s.contactCard}>
            {contactItems.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[s.contactRow, i < contactItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                onPress={() => openURL(item.url)}
                disabled={!item.url}
                activeOpacity={item.url ? 0.6 : 1}
              >
                <View style={s.contactIcon}>
                  <Icon name={item.icon} size={18} color={C.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.contactLabel}>{item.label}</Text>
                  <Text style={[s.contactValue, !!item.url && { color: C.accent }]}>{item.value}</Text>
                </View>
                {!!item.url && <Icon name="open-in-new" size={14} color={C.textMut} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Legal ── */}
        <View style={[s.section, { paddingTop: 0 }]}>
          <View style={s.legalCard}>
            {['Privacy Policy', 'Terms & Conditions', 'Refund Policy'].map((label, i, arr) => (
              <TouchableOpacity
                key={label}
                style={[s.legalRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
              >
                <Text style={s.legalText}>{label}</Text>
                <Icon name="chevron-right" size={18} color={C.textMut} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          {/* <Text style={s.footerText}>© 2025 Maharaj Enterprise. All rights reserved.</Text> */}
          <Text style={s.footerTex}>Version {Constants.APP_VERSION}</Text>
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.surface,
    // borderBottomWidth: 1, borderBottomColor: C.border,
    zIndex: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 9,
    backgroundColor: C.bg,
    //  borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textColor, letterSpacing: 0.3 },

  // Hero
  hero: { paddingTop: 28, paddingBottom: 36, paddingHorizontal: 24, overflow: 'hidden' },
  heroAccentStripe: {
    position: 'absolute', top: 0, right: 0,
    width: 4, height: '100%', backgroundColor: C.accent, opacity: 0.35,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: C.accentLt, borderRadius: 5,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 16, gap: 6,
    borderWidth: 1, borderColor: '#F0C8A0',
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 1.3 },
  heroName: {
    fontSize: 40, fontWeight: '900', color: C.textPri,
    lineHeight: 46, letterSpacing: -1, marginBottom: 12,
  },
  heroTagline: { fontSize: 15, color: C.textSec, lineHeight: 23, marginBottom: 16 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroMetaText: { fontSize: 12, color: C.steel },

  // Layout
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  divider: { height: 1, backgroundColor: C.border },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 8 },
  sectionLabelBar: { width: 3, height: 13, backgroundColor: C.accent, borderRadius: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: C.textMut, letterSpacing: 1.6 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    padding: 16, alignItems: 'center', gap: 6,
    ...CARD_SHADOW,
  },
  statIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: C.accentLt,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  statNumber: { fontSize: 24, fontWeight: '900', color: C.textPri },
  statLabel:  { fontSize: 11, color: C.textSec, textAlign: 'center' },

  // Body
  bodyText: { fontSize: 14, color: C.textSec, lineHeight: 22 },

  // Industries
  industryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  industryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.card, borderRadius: 6,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 11, paddingVertical: 7,
  },
  industryChipText: { fontSize: 12, color: C.textSec, fontWeight: '600' },

  // Mission / Vision
  mvCard: {
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    flexDirection: 'row', overflow: 'hidden',
    ...CARD_SHADOW,
  },
  mvCardBar: { width: 4, backgroundColor: C.accent },
  mvCardInner: { flex: 1, padding: 16 },
  mvIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  mvCardTitle: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 1.3 },
  mvCardText: { fontSize: 13, color: C.textSec, lineHeight: 20 },

  // Features
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  featureIconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: C.textPri, marginBottom: 3 },
  featureDesc:  { fontSize: 12, color: C.textSec, lineHeight: 18 },

  // Commitment
  commitCard: {
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  commitTopBar: { height: 4, backgroundColor: C.accent },
  commitInner: { padding: 24, alignItems: 'center' },
  commitIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.accentLt,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: '#F0C8A0',
  },
  commitTitle: { fontSize: 15, fontWeight: '800', color: C.textPri, marginBottom: 10, textAlign: 'center' },
  commitText:  { fontSize: 13, color: C.textSec, lineHeight: 20, textAlign: 'center' },

  // Contact
  contactCard: {
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    ...CARD_SHADOW,
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
  },
  contactIcon: {
    width: 38, height: 38, borderRadius: 9,
    backgroundColor: C.accentLt, justifyContent: 'center', alignItems: 'center',
  },
  contactLabel: { fontSize: 10, color: C.textMut, marginBottom: 2, fontWeight: '600', letterSpacing: 0.5 },
  contactValue: { fontSize: 13, color: C.textPri, fontWeight: '600' },

  // Legal
  legalCard: {
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
    ...CARD_SHADOW,
  },
  legalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15,
  },
  legalText: { fontSize: 14, color: C.textSec },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 28 },
  footerText: { fontSize: 11, color: C.textMut, marginBottom: 4 },
  versionText: { fontSize: 11, color: C.textMut + '70' },
});

export default AboutUsScreen;