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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = SCREEN_WIDTH - 48;
const BAR_HEIGHT = 66;

const TAB_CONFIG: Record<string, { icon: string; label: string; activeColor: string; activeBg: string }> = {
  HomeTab:     { icon: '🏠', label: 'Home',     activeColor: '#007AFF', activeBg: 'rgba(0,122,255,0.12)' },
  RechargeTab: { icon: '⚡', label: 'Recharge', activeColor: '#FF9500', activeBg: 'rgba(255,149,0,0.12)' },
  WalletTab:   { icon: '💳', label: 'Wallet',   activeColor: '#34C759', activeBg: 'rgba(52,199,89,0.12)' },
  HistoryTab:  { icon: '🕐', label: 'History',  activeColor: '#5856D6', activeBg: 'rgba(88,86,214,0.12)' },
  ProfileTab:  { icon: '👤', label: 'Profile',  activeColor: '#FF2D55', activeBg: 'rgba(255,45,85,0.12)' },
};

const AnimatedTab = ({
  route,
  isFocused,
  onPress,
}: {
  route: { name: string };
  isFocused: boolean;
  onPress: () => void;
}) => {
  const config = TAB_CONFIG[route.name] ?? { icon: '•', label: route.name, activeColor: '#007AFF', activeBg: 'rgba(0,122,255,0.1)' };

  const scale = useSharedValue(1);
  const pillWidth = useSharedValue(0);
  const labelOpacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.08 : 1, { damping: 18, stiffness: 260 });
    pillWidth.value = withSpring(isFocused ? 1 : 0, { damping: 20, stiffness: 300 });
    labelOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillWidth.value,
    transform: [{ scaleX: pillWidth.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateX: (1 - labelOpacity.value) * -6 }],
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
      <View style={styles.tabInner}>
        {/* Pill background */}
        <Animated.View
          style={[
            styles.activePill,
            { backgroundColor: config.activeBg },
            pillStyle,
          ]}
        />
        <View style={styles.tabContent}>
          {/* Icon */}
          <Animated.Text
            style={[
              styles.tabIcon,
              isFocused ? styles.tabIconActive : styles.tabIconInactive,
              iconStyle,
            ]}
          >
            {config.icon}
          </Animated.Text>
          {/* Animated label slides in when active */}
          {isFocused && (
            <Animated.Text
              style={[
                styles.tabLabel,
                { color: config.activeColor },
                labelStyle,
              ]}
              numberOfLines={1}
            >
              {config.label}
            </Animated.Text>
          )}
        </View>
        {/* Active dot */}
        {isFocused && (
          <View style={[styles.dot, { backgroundColor: config.activeColor }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom + 8, 20);

  return (
    <View style={[styles.wrapper, { bottom }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          return <AnimatedTab key={route.key} route={route} isFocused={isFocused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
};

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
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 36,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 28,
      },
      android: { elevation: 18 },
    }),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  tabTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 44,
    minHeight: 44,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: -10,
    right: -10,
    bottom: 0,
    borderRadius: 22,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabIconInactive: {
    opacity: 0.45,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
