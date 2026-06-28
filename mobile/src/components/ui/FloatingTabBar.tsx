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

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = SCREEN_WIDTH - 48;
const BAR_HEIGHT = 68;

const TAB_CONFIG: Record<
  string,
  { icon: string; label: string; color: string; bg: string }
> = {
  HomeTab:     { icon: '🏠', label: 'Home',     color: '#1D6FEB', bg: 'rgba(29,111,235,0.12)' },
  RechargeTab: { icon: '⚡', label: 'Recharge', color: '#D97B00', bg: 'rgba(217,123,0,0.12)'  },
  WalletTab:   { icon: '💳', label: 'Wallet',   color: '#1AAF5D', bg: 'rgba(26,175,93,0.12)'  },
  HistoryTab:  { icon: '🕐', label: 'History',  color: '#5856D6', bg: 'rgba(88,86,214,0.12)'  },
  ProfileTab:  { icon: '👤', label: 'Profile',  color: '#D92D5F', bg: 'rgba(217,45,95,0.12)'  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Single Tab Item
// ─────────────────────────────────────────────────────────────────────────────

const TabItem = ({
  route,
  isFocused,
  onPress,
}: {
  route: { name: string };
  isFocused: boolean;
  onPress: () => void;
}) => {
  const cfg = TAB_CONFIG[route.name] ?? {
    icon: '·',
    label: route.name,
    color: '#007AFF',
    bg: 'rgba(0,122,255,0.12)',
  };

  const scale = useSharedValue(1);
  const pillBg = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.12 : 1, { damping: 16, stiffness: 280 });
    pillBg.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillAnim = useAnimatedStyle(() => ({
    opacity: pillBg.value,
    transform: [{ scale: 0.92 + pillBg.value * 0.08 }],
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.tabTouch}
      activeOpacity={1}
    >
      {/* Pill — always rendered but opacity-animated. Fixed width by content. */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: cfg.bg },
          pillAnim,
          // Position absolute so inactive tab takes zero flex space
          StyleSheet.absoluteFillObject,
          { position: 'absolute', left: 6, right: 6, top: '50%', marginTop: -20, height: 40, borderRadius: 20 },
        ]}
      />

      {/* Content always on top */}
      <View style={styles.tabContent}>
        <Animated.Text style={[styles.tabIcon, iconAnim]}>
          {cfg.icon}
        </Animated.Text>
        {isFocused && (
          <Text style={[styles.tabLabel, { color: cfg.color }]} numberOfLines={1}>
            {cfg.label}
          </Text>
        )}
      </View>

      {/* Active dot */}
      {isFocused && (
        <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      )}
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab Bar Container
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom + 10, 22);

  return (
    // Shadow wrapper — must NOT have overflow:hidden for shadows to work
    <View style={[styles.shadow, { bottom }]}>
      {/* Visible bar — clips rounded corners with overflow:hidden but only for bg */}
      <View style={styles.bar}>
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
              route={route}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Shadow wrapper (no overflow:hidden — shadows need this)
  shadow: {
    position: 'absolute',
    alignSelf: 'center',
    width: BAR_WIDTH,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: { elevation: 18 },
    }),
  },

  // Actual bar (white background, rounded)
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    // overflow hidden only here for rounding — shadows on parent
    overflow: 'hidden',
  },

  // Each tab gets equal flex space
  tabTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pill background (absolute, contained within tabTouch)
  pill: {
    borderRadius: 20,
  },

  // Icon + label row, sits above the pill
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },

  tabIcon: {
    fontSize: 21,
  },

  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Small dot below the tab
  dot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
