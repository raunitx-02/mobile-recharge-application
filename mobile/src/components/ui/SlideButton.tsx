import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme';

interface SlideButtonProps {
  onComplete: () => void;
  title?: string;
  width?: number;
}

const BUTTON_HEIGHT = 56;
const PADDING = 4;
const THUMB_SIZE = BUTTON_HEIGHT - PADDING * 2;

export const SlideButton: React.FC<SlideButtonProps> = ({ 
  onComplete, 
  title = 'Slide to Pay →', 
  width = Dimensions.get('window').width * 0.85 
}) => {
  const [complete, setComplete] = useState(false);
  const translationX = useSharedValue(0);
  const maxTravel = width - THUMB_SIZE - PADDING * 2;

  const triggerComplete = () => {
    setComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, ctx) => {
      ctx.startX = translationX.value;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      translationX.value = Math.max(0, Math.min(newX, maxTravel));
      
      // Add subtle haptic ticks during pull
      if (Math.floor(newX) % 30 === 0) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    onEnd: () => {
      if (translationX.value >= maxTravel * 0.85) {
        translationX.value = withSpring(maxTravel);
        runOnJS(triggerComplete)();
      } else {
        translationX.value = withSpring(0);
      }
    }
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }]
  }));

  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translationX.value,
      [0, maxTravel * 0.6],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  return (
    <View style={[styles.container, { width }]}>
      <Text style={styles.trackBackground}>OPTIONSPAY SECURE CHECKOUT</Text>
      
      <Animated.Text style={[styles.titleText, textStyle]}>
        {complete ? 'Processing Payment...' : title}
      </Animated.Text>
      
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={!complete}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientThumb}
          >
            <Text style={styles.thumbArrow}>{complete ? '✓' : '⚡'}</Text>
          </LinearGradient>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden'
  },
  trackBackground: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(0, 0, 0, 0.05)',
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: -0.2
  },
  thumb: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  gradientThumb: {
    width: '100%',
    height: '100%',
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  thumbArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff'
  }
});
