import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const { width: W } = Dimensions.get('window');
const BAR_W   = W - 32;   // 16px margin each side
const BAR_H   = 72;
const PILL_H  = 52;       // active pill height inside bar

const TABS = [
  { key: 'HomeTab',     icon: '⌂',  label: 'Home',     color: '#1D6FEB' },
  { key: 'RechargeTab', icon: '⚡', label: 'Recharge', color: '#D97B00' },
  { key: 'WalletTab',   icon: '◈',  label: 'Cashback', color: '#1AAF5D' },
  { key: 'HistoryTab',  icon: '◷',  label: 'History',  color: '#5856D6' },
  { key: 'ProfileTab',  icon: '⊙',  label: 'Profile',  color: '#D92D5F' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Single Tab Item — vertical stacked layout (NO horizontal overflow risk)
// ─────────────────────────────────────────────────────────────────────────────

const TabItem = ({
  tabKey,
  isFocused,
  onPress,
}: {
  tabKey: string;
  isFocused: boolean;
  onPress: () => void;
}) => {
  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const iconScale  = useSharedValue(1);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);
  const pillScale  = useSharedValue(isFocused ? 1 : 0.85);

  React.useEffect(() => {
    iconScale.value   = withSpring(isFocused ? 1.18 : 1, { damping: 14, stiffness: 260 });
    pillOpacity.value = withTiming(isFocused ? 1 : 0,    { duration: 220 });
    pillScale.value   = withSpring(isFocused ? 1 : 0.85, { damping: 18, stiffness: 240 });
  }, [isFocused]);

  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const pillAnim = useAnimatedStyle(() => ({
    opacity:   pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.tabTouch}
      activeOpacity={0.9}
    >
      {/* Glass active pill — absolute, stays fully within touch area */}
      <Animated.View style={[styles.activePill, pillAnim]} />

      {/* Icon */}
      <Animated.Text
        style={[
          styles.tabIcon,
          { color: isFocused ? tab.color : '#94A3B8' },
          iconAnim,
        ]}
      >
        {tab.icon}
      </Animated.Text>

      {/* Label */}
      <Text
        style={[
          styles.tabLabel,
          { color: isFocused ? tab.color : '#94A3B8' },
          isFocused && styles.tabLabelActive,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Tab Bar
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom + 12, 24);

  const renderContent = () => (
    <View style={styles.row}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <TabItem
            key={route.key}
            tabKey={route.name}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );

  return (
    <View style={[styles.wrapper, { bottom }]}>
      {/* Liquid glass container — BlurView on iOS, white fallback on Android */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={85}
          tint="light"
          style={styles.bar}
        >
          <View style={styles.glassOverlay} />
          {renderContent()}
        </BlurView>
      ) : (
        <View style={[styles.bar, styles.barAndroid]}>
          {renderContent()}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignSelf: 'center',
    width: BAR_W,
    // Shadow on the wrapper (no overflow:hidden = shadows work)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 32,
      },
      android: { elevation: 24 },
    }),
  },

  // The blurred pill bar — overflow:hidden clips blur/bg to rounded shape
  bar: {
    height: BAR_H,
    borderRadius: BAR_H / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },

  barAndroid: {
    backgroundColor: 'rgba(255,255,255,0.97)',
  },

  // Thin white overlay on top of blur for the "frosted" tint
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  // All tabs in a horizontal row
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Each tab — vertical stacking, NO horizontal icon+label = no overflow
  tabTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  // Active glass pill — absolute, inset 6px from all sides of touch area
  activePill: {
    position: 'absolute',
    top: 6,
    left: 4,
    right: 4,
    bottom: 6,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.88)',
    // Inner shadow via border
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },

  tabIcon: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 2,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  tabLabelActive: {
    fontWeight: '800',
    fontSize: 10.5,
  },
});
