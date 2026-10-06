import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
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

export interface OnboardingSlideItem {
  id: string;
  index: number;
  title: string;
  description: string;
}

const ONBOARDING_SLIDES: OnboardingSlideItem[] = [
  {
    id: 'slide-dose-reminders',
    index: 0,
    title: 'Never Miss a Dose',
    description:
      'Get gentle, timely reminders for every medicine, so taking your pills on time becomes simple and stress-free.',
  },
  {
    id: 'slide-track-adherence',
    index: 1,
    title: 'Track Your Adherence',
    description:
      'See how well you follow your treatment each day and week, and celebrate your progress along the way.',
  },
  {
    id: 'slide-connect-caregivers',
    index: 2,
    title: 'Stay Connected with Caregivers',
    description:
      'Link a family member or caregiver who is alerted when a dose is missed, and get help fast in an emergency.',
  },
];

const RING_SIZE = 96;
const INNER_BUTTON_SIZE = 68;
const STROKE_WIDTH = 3.5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OnboardingScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlideItem>>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      if (windowWidth > 0) {
        const index = Math.round(offsetX / windowWidth);
        if (index >= 0 && index < ONBOARDING_SLIDES.length && index !== currentIndex) {
          setCurrentIndex(index);
        }
      }
    },
    [currentIndex, windowWidth]
  );

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
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

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  // Progress is 1/3, 2/3, 3/3 (1.0)
  const progress = (currentIndex + 1) / ONBOARDING_SLIDES.length;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  /**
   * Render distinct illustration based on the specific slide index
   */
  const renderSlideIllustration = (index: number) => {
    switch (index) {
      case 0:
        return <DoseReminderIllustration size={Math.min(windowWidth * 0.76, 290)} />;
      case 1:
        return <AdherenceTrackerIllustration size={Math.min(windowWidth * 0.76, 290)} />;
      case 2:
        return <CaregiverConnectionIllustration size={Math.min(windowWidth * 0.76, 290)} />;
      default:
        return <DoseReminderIllustration size={Math.min(windowWidth * 0.76, 290)} />;
    }
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlideItem;
    index: number;
  }) => {
    return (
      <View style={[styles.slideContainer, { width: windowWidth }]} key={item.id}>
        {/* Upper distinct illustration area */}
        <View style={styles.illustrationWrapper}>
          {renderSlideIllustration(index)}
        </View>

        {/* Text information area showing slide's unique title and description */}
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

  const getItemLayout = (_: any, index: number) => ({
    length: windowWidth,
    offset: windowWidth * index,
    index,
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Swipeable Slides FlatList */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToInterval={windowWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
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
          accessibilityLabel={`Slide ${currentIndex + 1} of ${ONBOARDING_SLIDES.length}`}
        >
          {ONBOARDING_SLIDES.map((_, i) => {
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
    maxWidth: 320,
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
