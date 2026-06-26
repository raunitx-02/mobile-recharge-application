import React from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  color1: string;
  color2: string;
}

interface BannerCarouselProps {
  banners: BannerItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 140;

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    }
  });

  const renderItem = ({ item, index }: { item: BannerItem; index: number }) => {
    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[item.color1, item.color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LIMITED OFFER</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={CAROUSEL_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 16
  },
  cardContainer: {
    width: CAROUSEL_WIDTH,
    height: CARD_HEIGHT
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    position: 'relative'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  }
});
