import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  color1: string;
  color2: string;
  icon: string;
}

interface BannerCarouselProps {
  banners: BannerItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 168;

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotScale = useRef(banners.map(() => new Animated.Value(1))).current;

  // Auto-scroll every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * (CARD_WIDTH + 12), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Animate active dot
  useEffect(() => {
    dotScale.forEach((dot, i) => {
      Animated.spring(dot, {
        toValue: i === activeIndex ? 1.4 : 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 180,
      }).start();
    });
  }, [activeIndex]);

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((item, index) => (
          <View key={item.id} style={styles.cardWrap}>
            <LinearGradient
              colors={[item.color1, item.color2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Decorative circles */}
              <View style={styles.circle1} />
              <View style={styles.circle2} />
              <View style={styles.circle3} />

              {/* Big icon top right */}
              <Text style={styles.bigIcon}>{item.icon}</Text>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
                  <Text style={styles.ctaText}>{item.cta}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {banners.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
              { transform: [{ scale: dotScale[i] }] }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cardWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  // Decorative abstract circles
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -60,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 20,
    right: 60,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -20,
    left: -20,
  },
  bigIcon: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 56,
    opacity: 0.85,
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 17,
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    marginBottom: 4,
  },
  dot: {
    borderRadius: 3,
    height: 5,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#007AFF',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
});
