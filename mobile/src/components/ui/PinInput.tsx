import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { colors } from '../../theme';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({ length = 6, value, onChange, error }) => {
  const inputRef = useRef<TextInput>(null);
  const shakeOffset = useSharedValue(0);

  useEffect(() => {
    if (error) {
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }]
  }));

  const cells = Array(length).fill(0);

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={length}
        value={value}
        onChangeText={onChange}
        caretHidden
      />
      <View style={styles.grid}>
        {cells.map((_, index) => {
          const char = value[index] || '';
          const isFocused = index === value.length;
          
          return (
            <View 
              key={index} 
              style={[
                styles.cell, 
                isFocused && styles.cellFocused,
                char !== '' && styles.cellFilled
              ]}
            >
              <TextInput 
                style={styles.cellText} 
                editable={false}
                value={char}
                secureTextEntry={false}
              />
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center'
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 1
  },
  grid: {
    flexDirection: 'row',
    gap: 10
  },
  cell: {
    width: 44,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  cellFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff'
  },
  cellFilled: {
    borderColor: 'rgba(0, 122, 255, 0.3)'
  },
  cellText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text
  }
});
