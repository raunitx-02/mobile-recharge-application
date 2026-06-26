import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.88;

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const tabsCount = state.routes.length;
  const tabWidth = (TAB_BAR_WIDTH - 8) / tabsCount;
  
  const indicatorX = useSharedValue(0);

  React.useEffect(() => {
    indicatorX.value = withSpring(state.index * tabWidth, {
      damping: 18,
      stiffness: 150
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }]
  }));

  const renderIcon = (routeName: string, isFocused: boolean) => {
    const activeColor = colors.primary;
    const inactiveColor = colors.textTertiary;
    const color = isFocused ? activeColor : inactiveColor;

    switch (routeName) {
      case 'HomeTab':
        return <Animated.Text style={[styles.iconText, { color }]}>⌂</Animated.Text>;
      case 'RechargeTab':
        return <Animated.Text style={[styles.iconText, { color }]}>⚡</Animated.Text>;
      case 'WalletTab':
        return <Animated.Text style={[styles.iconText, { color }]}>💰</Animated.Text>;
      case 'HistoryTab':
        return <Animated.Text style={[styles.iconText, { color }]}>◴</Animated.Text>;
      case 'ProfileTab':
        return <Animated.Text style={[styles.iconText, { color }]}>👤</Animated.Text>;
      default:
        return <Animated.Text style={[styles.iconText, { color }]}>•</Animated.Text>;
    }
  };

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 12) }]}>
      <BlurView intensity={85} tint="light" style={styles.blurContainer}>
        {/* Sliding Indicator Background */}
        <Animated.View 
          style={[
            styles.indicator, 
            { width: tabWidth }, 
            indicatorStyle
          ]} 
        />

        {/* Tab Buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
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
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.9}
            >
              {renderIcon(route.name, isFocused)}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: TAB_BAR_WIDTH,
    height: 64,
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
    overflow: 'hidden'
  },
  blurContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)'
  },
  indicator: {
    position: 'absolute',
    left: 4,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)'
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconText: {
    fontSize: 26,
    fontWeight: '600'
  }
});
