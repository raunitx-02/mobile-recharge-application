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
const BAR_HORIZ_MARGIN = 24;
const BAR_WIDTH = SCREEN_WIDTH - BAR_HORIZ_MARGIN * 2;
const BAR_HEIGHT = 68;
const PILL_H = 40;
const PILL_PADDING_H = 14;

const TAB_CONFIG: Record<
  string,
  { icon: string; label: string; color: string; bg: string }
> = {
  HomeTab:     { icon: '🏠', label: 'Home',     color: '#1D6FEB', bg: 'rgba(29,111,235,0.11)' },
  RechargeTab: { icon: '⚡', label: 'Recharge', color: '#E07B00', bg: 'rgba(224,123,0,0.11)' },
  WalletTab:   { icon: '💳', label: 'Wallet',   color: '#1AAF5D', bg: 'rgba(26,175,93,0.11)' },
  HistoryTab:  { icon: '🕐', label: 'History',  color: '#5856D6', bg: 'rgba(88,86,214,0.11)' },
  ProfileTab:  { icon: '👤', label: 'Profile',  color: '#D92D5F', bg: 'rgba(217,45,95,0.11)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Single tab item — self-contained pill with NO overflow outside its bounds
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
    icon: '•',
    label: route.name,
    color: '#007AFF',
    bg: 'rgba(0,122,255,0.1)',
  };

  // Animate icon scale
  const scale = useSharedValue(1);
  // Animate label width (0 → 1)
  const labelProg = useSharedValue(isFocused ? 1 : 0);
  // Animate pill background opacity
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.15 : 1, {
      damping: 16,
      stiffness: 300,
    });
    labelProg.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelProg.value,
    // Clamp maxWidth: 0 when inactive → natural size when active
    // This avoids any layout overflow
    maxWidth: labelProg.value * 80,
    marginLeft: labelProg.value * 5,
    overflow: 'hidden' as const,
  }));

  const pillAnimStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
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
      {/* The pill is INSIDE the touch area, flex-contained, no absolute overflow */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: cfg.bg },
          pillAnimStyle,
        ]}
      >
        {/* Icon */}
        <Animated.Text style={[styles.icon, iconAnimStyle]}>
          {cfg.icon}
        </Animated.Text>

        {/* Label — animates width from 0 to natural size */}
        <Animated.Text
          style={[styles.label, { color: cfg.color }, labelAnimStyle]}
          numberOfLines={1}
        >
          {cfg.label}
        </Animated.Text>
      </Animated.View>

      {/* Dot indicator under icon */}
      {isFocused && (
        <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      )}
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab bar container
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom + 10, 22);

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]}>
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
  wrapper: {
    position: 'absolute',
    alignSelf: 'center',
    width: BAR_WIDTH,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: BAR_HEIGHT / 2,
    // Clip children so nothing overflows the rounded pill bar
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.13,
        shadowRadius: 30,
      },
      android: { elevation: 20 },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tabTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // No overflow possible since parent has overflow:'hidden'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: PILL_H,
    paddingHorizontal: PILL_PADDING_H,
    borderRadius: PILL_H / 2,
    // Self-sizing — no absolute position, no negative margins
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
