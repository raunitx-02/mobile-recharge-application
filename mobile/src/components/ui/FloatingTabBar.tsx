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
// Config — real emojis only (universal rendering)
// ─────────────────────────────────────────────────────────────────────────────

const { width: W } = Dimensions.get('window');
const BAR_W = W - 40;   // 20px each side
const BAR_H = 70;

const TABS: Record<string, { emoji: string; label: string; color: string; activeBg: string }> = {
  HomeTab:     { emoji: '🏠', label: 'Home',     color: '#1A6FEB', activeBg: 'rgba(26,111,235,0.10)' },
  RechargeTab: { emoji: '⚡', label: 'Recharge', color: '#D97B00', activeBg: 'rgba(217,123,0,0.10)'  },
  WalletTab:   { emoji: '💰', label: 'Cashback', color: '#059669', activeBg: 'rgba(5,150,105,0.10)'  },
  HistoryTab:  { emoji: '📋', label: 'History',  color: '#5856D6', activeBg: 'rgba(88,86,214,0.10)'  },
  ProfileTab:  { emoji: '👤', label: 'Profile',  color: '#DC2D5F', activeBg: 'rgba(220,45,95,0.10)'  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Single tab
// ─────────────────────────────────────────────────────────────────────────────

const TabItem = React.memo(({
  tabKey,
  isFocused,
  onPress,
}: {
  tabKey: string;
  isFocused: boolean;
  onPress: () => void;
}) => {
  const tab = TABS[tabKey] ?? TABS.HomeTab;

  const emojiScale   = useSharedValue(1);
  const pillOpacity  = useSharedValue(isFocused ? 1 : 0);
  const pillScale    = useSharedValue(isFocused ? 1 : 0.8);

  React.useEffect(() => {
    emojiScale.value  = withSpring(isFocused ? 1.22 : 1,    { damping: 12, stiffness: 280 });
    pillOpacity.value = withTiming(isFocused ? 1   : 0,    { duration: 230 });
    pillScale.value   = withSpring(isFocused ? 1   : 0.8,  { damping: 16, stiffness: 260 });
  }, [isFocused]);

  const emojiAnim = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const pillAnim = useAnimatedStyle(() => ({
    opacity:   pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  return (
    <TouchableOpacity
      style={styles.touch}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.85}
    >
      {/* Coloured pill behind icon+label */}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: isFocused ? tab.activeBg : 'transparent' },
          pillAnim,
        ]}
      />

      {/* Emoji icon */}
      <Animated.Text style={[styles.emoji, emojiAnim]}>
        {tab.emoji}
      </Animated.Text>

      {/* Label */}
      <Text
        style={[
          styles.label,
          {
            color: isFocused ? tab.color : '#9CA3AF',
            fontWeight: isFocused ? '700' : '500',
          },
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>

      {/* Active dot */}
      {isFocused && (
        <View style={[styles.dot, { backgroundColor: tab.color }]} />
      )}
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────────────────────

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom + 10, 20);

  return (
    <View style={[styles.shadow, { bottom }]}>
      {/* Bar: rounded pill with frosted look */}
      <View style={styles.bar}>
        {/* Glass top highlight line */}
        <View style={styles.glassHighlight} />

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
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Shadow wrapper — NO overflow:hidden so shadows render on Android
  shadow: {
    position: 'absolute',
    alignSelf: 'center',
    width: BAR_W,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
      },
      android: { elevation: 22 },
    }),
  },

  // The visible pill bar
  bar: {
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BAR_H / 2,
    overflow: 'hidden',          // clips pill highlights to rounded shape
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },

  // Thin white shimmer at the top — creates "glass" illusion
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,1)',
    opacity: 0.8,
    borderRadius: 1,
  },

  // Each tab — vertical stack, equal flex
  touch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },

  // Coloured pill — absolute, fully contained in touch area
  pill: {
    position: 'absolute',
    top: 8,
    left: 6,
    right: 6,
    bottom: 8,
    borderRadius: 28,
  },

  // Emoji icon
  emoji: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 3,
  },

  // Tab label below emoji
  label: {
    fontSize: 10,
    letterSpacing: 0.1,
  },

  // Active indicator dot
  dot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
