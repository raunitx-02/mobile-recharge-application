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
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH - 40;
const NUM_TABS = 5;
const TAB_WIDTH = (TAB_BAR_WIDTH - 8) / NUM_TABS;

const TAB_CONFIG: Record<string, { icon: string; label: string; activeColor: string }> = {
  HomeTab:    { icon: '⌂',  label: 'Home',    activeColor: '#007AFF' },
  RechargeTab:{ icon: '⚡', label: 'Recharge', activeColor: '#FF9500' },
  WalletTab:  { icon: '💳', label: 'Wallet',   activeColor: '#34C759' },
  HistoryTab: { icon: '🕐', label: 'History',  activeColor: '#5856D6' },
  ProfileTab: { icon: '👤', label: 'Profile',  activeColor: '#FF3B30' },
};

const AnimatedTabItem = ({
  route,
  isFocused,
  onPress,
}: {
  route: { name: string };
  isFocused: boolean;
  onPress: () => void;
}) => {
  const config = TAB_CONFIG[route.name] || { icon: '•', label: route.name, activeColor: '#007AFF' };
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1.05 : 1, { damping: 15, stiffness: 200 });
    dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotOpacity.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabButton}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      <Animated.View style={[styles.tabInner, animStyle]}>
        {/* Active background pill */}
        {isFocused && (
          <View style={[styles.activePill, { backgroundColor: `${config.activeColor}15` }]} />
        )}

        {/* Icon */}
        <Text style={[
          styles.tabIcon,
          { color: isFocused ? config.activeColor : '#8E8E93' }
        ]}>
          {config.icon}
        </Text>

        {/* Label */}
        <Text style={[
          styles.tabLabel,
          { color: isFocused ? config.activeColor : '#8E8E93' },
          isFocused && { fontWeight: '700' }
        ]}>
          {config.label}
        </Text>

        {/* Active dot */}
        <Animated.View style={[styles.activeDot, { backgroundColor: config.activeColor }, dotStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom + 4, 16) }]}>
      <BlurView intensity={90} tint="light" style={styles.blur}>
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            return (
              <AnimatedTabItem
                key={route.key}
                route={route}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: TAB_BAR_WIDTH,
    height: 70,
    borderRadius: 35,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 24,
    position: 'relative',
    minWidth: 56,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  tabIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
