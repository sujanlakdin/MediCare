import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  DoseReminderIllustration,
  AdherenceTrackerIllustration,
  CaregiverConnectionIllustration,
} from '../../components/auth/OnboardingIllustrations';

const { width } = Dimensions.get('window');

interface SlideItem {
  id: string;
  title: string;
  description: string;
  Illustration: React.ComponentType;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Never Miss a Dose',
    description:
      'Get gentle, timely reminders for every medicine, so taking your pills on time becomes simple and stress-free.',
    Illustration: DoseReminderIllustration,
  },
  {
    id: '2',
    title: 'Track Your Adherence',
    description:
      'See how well you follow your treatment each day and week, and celebrate your progress along the way.',
    Illustration: AdherenceTrackerIllustration,
  },
  {
    id: '3',
    title: 'Stay Connected with Caregivers',
    description:
      'Link a family member or caregiver who is alerted when a dose is missed, and get help fast in an emergency.',
    Illustration: CaregiverConnectionIllustration,
  },
];

const RING_SIZE = 96;
const INNER_BUTTON_SIZE = 68;
const STROKE_WIDTH = 3.5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / width);
      if (index >= 0 && index < SLIDES.length && index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [currentIndex]
  );

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/welcome' as any);
    }
  };

  const handleSkipOrStart = () => {
    router.replace('/welcome' as any);
  };

  // Progress is 1/3, 2/3, 3/3 (1.0)
  const progress = (currentIndex + 1) / SLIDES.length;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlide = ({ item }: { item: SlideItem }) => {
    const { Illustration } = item;
    return (
      <View style={styles.slideContainer}>
        {/* Upper illustration area */}
        <View style={styles.illustrationWrapper}>
          <Illustration />
        </View>

        {/* Text information area */}
        <View style={styles.textContainer}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            allowFontScaling={true}
          >
            {item.title}
          </Text>
          <Text style={styles.description} allowFontScaling={true}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Swipeable Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Bottom Controls Area */}
      <View style={styles.controlsContainer}>
        {/* Page Dots Indicator */}
        <View
          style={styles.dotsRow}
          accessible={true}
          accessibilityLabel={`Step ${currentIndex + 1} of ${SLIDES.length}`}
        >
          {SLIDES.map((_, i) => {
            const isActive = i === currentIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>

        {/* Circular Progress Arrow Button */}
        <View style={styles.progressButtonWrapper}>
          {/* Progress Ring */}
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={styles.progressSvg}
          >
            {/* Background Track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#E4F5EC"
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Dynamic Progress Stroke */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#006A4E"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>

          {/* Inner Circular Button with Forward Arrow */}
          <TouchableOpacity
            style={styles.innerButton}
            onPress={handleNext}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              isLastSlide ? 'Get Started with MediCare' : `Go to slide ${currentIndex + 2}`
            }
          >
            <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="#FFFFFF"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Bottom Skip / Get Started Text Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipOrStart}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? 'Get Started' : 'Skip onboarding walkthrough'}
        >
          <Text style={styles.skipText} allowFontScaling={true}>
            {isLastSlide ? 'Get Started' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginTop: Platform.OS === 'web' ? 10 : 20,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F3D2E',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
    textAlign: 'center',
    maxWidth: 310,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 12,
  },
  dot: {
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activeDot: {
    width: 26,
    height: 8,
    backgroundColor: '#006A4E',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#CBD5E1',
  },
  progressButtonWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  innerButton: {
    width: INNER_BUTTON_SIZE,
    height: INNER_BUTTON_SIZE,
    borderRadius: INNER_BUTTON_SIZE / 2,
    backgroundColor: '#006A4E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006A4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  skipButton: {
    minHeight: 48,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
});
