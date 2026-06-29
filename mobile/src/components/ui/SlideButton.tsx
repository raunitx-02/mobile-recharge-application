import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
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
  const panX = useRef(new Animated.Value(0)).current;
  const maxTravel = width - THUMB_SIZE - PADDING * 2;

  const triggerComplete = () => {
    setComplete(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !complete,
      onPanResponderMove: (_, gestureState) => {
        if (complete) return;
        const newX = Math.max(0, Math.min(gestureState.dx, maxTravel));
        panX.setValue(newX);
        
        // Add subtle haptic ticks during pull
        if (Math.floor(newX) % 30 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (complete) return;
        if (gestureState.dx >= maxTravel * 0.85) {
          Animated.spring(panX, {
            toValue: maxTravel,
            useNativeDriver: true,
            tension: 40,
            friction: 7
          }).start(() => {
            triggerComplete();
          });
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7
          }).start();
        }
      }
    })
  ).current;

  const textOpacity = panX.interpolate({
    inputRange: [0, maxTravel * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
    <View style={[styles.container, { width }]}>
      <Text style={styles.trackBackground}>OPTIONSPAY SECURE CHECKOUT</Text>
      
      <Animated.Text style={[styles.titleText, { opacity: textOpacity }]}>
        {complete ? 'Processing Payment...' : title}
      </Animated.Text>
      
      <Animated.View 
        style={[
          styles.thumb, 
          { transform: [{ translateX: panX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientThumb}
        >
          <Text style={styles.thumbArrow}>{complete ? '✓' : '⚡'}</Text>
        </LinearGradient>
      </Animated.View>
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
