import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const { width } = Dimensions.get('window');
const ART_SIZE = Math.min(width * 0.78, 300);

const COLORS = {
  brand: '#006A4E',
  accent: '#3AB68B',
  deep: '#0F3D2E',
  mint: '#E4F5EC',
  mintDark: '#CDEFE0',
  danger: '#C94A4A',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  subtle: '#94A3B8',
};

/**
 * Slide 1 Illustration: "Never Miss a Dose"
 * Features: Soft mint backdrop blob, medicine bottle, reminder bell with red dot,
 * analog clock showing reminder time, two-tone capsule, and decorative botanical leaves.
 */
export function DoseReminderIllustration() {
  return (
    <View style={styles.container}>
      <Svg
        width={ART_SIZE}
        height={ART_SIZE * 0.92}
        viewBox="0 0 320 280"
        accessibilityRole="image"
        accessibilityLabel="Medicine bottle, clock, and reminder bell illustration"
      >
        {/* Soft mint backdrop blob */}
        <Path
          d="M70,70 C110,25 215,20 255,60 C295,100 305,185 260,225 C215,265 110,265 65,225 C20,185 30,115 70,70 Z"
          fill={COLORS.mint}
        />
        <Path
          d="M90,85 C125,45 200,40 240,75 C280,110 275,180 235,215 C195,250 115,245 80,210 C45,175 55,125 90,85 Z"
          fill={COLORS.mintDark}
          opacity={0.45}
        />

        {/* Botanical leaves curling from bottom left */}
        <Path
          d="M35,220 C45,185 80,180 100,195 C75,205 60,225 35,220 Z"
          fill={COLORS.accent}
          opacity={0.8}
        />
        <Path
          d="M20,200 C35,170 70,172 85,188 C62,192 45,210 20,200 Z"
          fill={COLORS.brand}
          opacity={0.7}
        />

        {/* Medicine / Pill Bottle (Center-Left) */}
        {/* Bottle Body */}
        <Rect
          x="75"
          y="110"
          width="80"
          height="105"
          rx="18"
          fill={COLORS.brand}
        />
        {/* Bottle Cap */}
        <Rect
          x="87"
          y="96"
          width="56"
          height="16"
          rx="6"
          fill={COLORS.deep}
        />
        {/* Bottle Label */}
        <Rect
          x="83"
          y="130"
          width="64"
          height="62"
          rx="10"
          fill={COLORS.white}
        />
        {/* Medical Cross on label */}
        <Rect
          x="108"
          y="146"
          width="14"
          height="30"
          rx="3"
          fill={COLORS.accent}
        />
        <Rect
          x="100"
          y="154"
          width="30"
          height="14"
          rx="3"
          fill={COLORS.accent}
        />

        {/* Clock (Top-Right) */}
        <Circle cx="215" cy="115" r="42" fill={COLORS.white} stroke={COLORS.mintDark} strokeWidth="3" />
        <Circle cx="215" cy="115" r="36" fill="#F8FCFA" />
        {/* Hour markers */}
        <Circle cx="215" cy="85" r="2.5" fill={COLORS.subtle} />
        <Circle cx="245" cy="115" r="2.5" fill={COLORS.subtle} />
        <Circle cx="215" cy="145" r="2.5" fill={COLORS.subtle} />
        <Circle cx="185" cy="115" r="2.5" fill={COLORS.subtle} />
        {/* Clock Hands pointing to 8:00 */}
        <Line x1="215" y1="115" x2="215" y2="92" stroke={COLORS.deep} strokeWidth="3.5" strokeLinecap="round" />
        <Line x1="215" y1="115" x2="198" y2="128" stroke={COLORS.deep} strokeWidth="3" strokeLinecap="round" />
        <Circle cx="215" cy="115" r="4" fill={COLORS.brand} />

        {/* Reminder Bell (Floating Middle Right) */}
        <G transform="translate(195, 160)">
          {/* Bell body */}
          <Path
            d="M25,8 C25,4 28,0 32,0 C36,0 39,4 39,8 C47,11 52,19 52,28 L55,42 L9,42 L12,28 C12,19 17,11 25,8 Z"
            fill={COLORS.accent}
          />
          {/* Bell clapper */}
          <Circle cx="32" cy="46" r="6" fill={COLORS.brand} />
          {/* Active Alert Dot (Red) */}
          <Circle cx="48" cy="8" r="8" fill={COLORS.danger} />
          <Circle cx="48" cy="8" r="4.5" fill={COLORS.white} />
        </G>

        {/* Two-tone capsule pill (Bottom Right) */}
        <G transform="translate(160, 215) rotate(-32)">
          {/* Left half - brand green */}
          <Path
            d="M12,4 L36,4 C42.6,4 48,9.4 48,16 C48,22.6 42.6,28 36,28 L12,28 C5.4,28 0,22.6 0,16 C0,9.4 5.4,4 12,4 Z"
            fill={COLORS.deep}
          />
          {/* Right half - mint/white */}
          <Path
            d="M24,4 L36,4 C42.6,4 48,9.4 48,16 C48,22.6 42.6,28 36,28 L24,28 Z"
            fill={COLORS.accent}
          />
          <Line x1="24" y1="4" x2="24" y2="28" stroke={COLORS.white} strokeWidth="2" />
        </G>
      </Svg>
    </View>
  );
}

/**
 * Slide 2 Illustration: "Track Your Adherence"
 * Features: White progress card with "85%" & bar chart, big green heart with
 * a crisp pulse line, and a green verified badge.
 */
export function AdherenceTrackerIllustration() {
  return (
    <View style={styles.container}>
      <Svg
        width={ART_SIZE}
        height={ART_SIZE * 0.92}
        viewBox="0 0 320 280"
        accessibilityRole="image"
        accessibilityLabel="Adherence statistics card with 85% score, heart pulse, and check badge"
      >
        {/* Soft mint backdrop blob */}
        <Path
          d="M60,65 C115,20 210,35 255,75 C300,115 300,195 255,235 C210,275 105,270 65,225 C25,180 5,110 60,65 Z"
          fill={COLORS.mint}
        />
        <Path
          d="M80,85 C125,50 195,60 235,95 C275,130 270,185 230,220 C190,255 110,250 80,215 C50,180 35,120 80,85 Z"
          fill={COLORS.mintDark}
          opacity={0.35}
        />

        {/* White Statistics Card */}
        <Rect
          x="55"
          y="70"
          width="135"
          height="145"
          rx="22"
          fill={COLORS.white}
          stroke={COLORS.mintDark}
          strokeWidth="2"
        />
        {/* Card Header Tag */}
        <Rect x="72" y="88" width="56" height="14" rx="7" fill={COLORS.mint} />
        <SvgText
          x="100"
          y="99"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill={COLORS.brand}
        >
          ADHERENCE
        </SvgText>

        {/* Big 85% Text */}
        <SvgText
          x="72"
          y="138"
          fontSize="36"
          fontWeight="800"
          fill={COLORS.brand}
        >
          85%
        </SvgText>

        {/* Mini 4-Bar Chart */}
        {/* Bar 1 */}
        <Rect x="72" y="172" width="16" height="26" rx="5" fill={COLORS.accent} />
        {/* Bar 2 */}
        <Rect x="94" y="162" width="16" height="36" rx="5" fill={COLORS.brand} />
        {/* Bar 3 */}
        <Rect x="116" y="152" width="16" height="46" rx="5" fill={COLORS.brand} />
        {/* Bar 4 */}
        <Rect x="138" y="168" width="16" height="30" rx="5" fill={COLORS.accent} />

        {/* Big Green Heart with Pulse Line (Right Side) */}
        <G transform="translate(160, 65)">
          {/* Heart Shape */}
          <Path
            d="M65,115 C25,85 0,60 0,35 C0,15 15,0 35,0 C48,0 60,8 65,18 C70,8 82,0 95,0 C115,0 130,15 130,35 C130,60 105,85 65,115 Z"
            fill={COLORS.brand}
          />
          {/* White Pulse / ECG Line */}
          <Path
            d="M10,48 L35,48 L44,28 L53,68 L64,36 L72,55 L80,48 L120,48"
            fill="none"
            stroke={COLORS.white}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>

        {/* Floating Green Tick Badge (Bottom Right) */}
        <G transform="translate(195, 175)">
          <Circle cx="26" cy="26" r="26" fill={COLORS.accent} />
          <Circle cx="26" cy="26" r="22" fill={COLORS.accent} stroke={COLORS.white} strokeWidth="2.5" />
          {/* White Checkmark */}
          <Path
            d="M16,26 L23,33 L36,19"
            fill="none"
            stroke={COLORS.white}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>

        {/* Sparkle accents */}
        <Path
          d="M50,45 L53,35 L56,45 L66,48 L56,51 L53,61 L50,51 L40,48 Z"
          fill={COLORS.accent}
          opacity={0.8}
        />
        <Path
          d="M260,180 L262,172 L264,180 L272,182 L264,184 L262,192 L260,184 L252,182 Z"
          fill={COLORS.accent}
          opacity={0.7}
        />
      </Svg>
    </View>
  );
}

/**
 * Slide 3 Illustration: "Stay Connected with Caregivers"
 * Features: Elderly patient and caregiver holding hands in supportive companionship,
 * floating coral heart above them, alert-bell bubble and pill bubble.
 */
export function CaregiverConnectionIllustration() {
  return (
    <View style={styles.container}>
      <Svg
        width={ART_SIZE}
        height={ART_SIZE * 0.92}
        viewBox="0 0 320 280"
        accessibilityRole="image"
        accessibilityLabel="Caregiver and patient holding hands with alert bell and medicine bubbles"
      >
        {/* Soft mint backdrop blob */}
        <Path
          d="M70,60 C125,20 215,25 255,70 C295,115 305,190 260,230 C215,270 100,270 60,225 C20,180 15,100 70,60 Z"
          fill={COLORS.mint}
        />
        <Path
          d="M85,80 C130,45 205,50 240,88 C275,126 270,185 235,220 C200,255 110,250 80,215 C50,180 40,115 85,80 Z"
          fill={COLORS.mintDark}
          opacity={0.35}
        />

        {/* Floating Coral Heart above heads */}
        <G transform="translate(142, 40)">
          <Path
            d="M18,30 C10,22 0,16 0,9 C0,4 4,0 9,0 C13,0 16,3 18,6 C20,3 23,0 27,0 C32,0 36,4 36,9 C36,16 26,22 18,30 Z"
            fill={COLORS.danger}
          />
        </G>

        {/* Floating Alert-Bell Bubble (Top Left) */}
        <G transform="translate(42, 65)">
          <Circle cx="22" cy="22" r="22" fill={COLORS.white} stroke={COLORS.mintDark} strokeWidth="2" />
          {/* Bell Icon */}
          <Path
            d="M18,12 C18,10 19,8 22,8 C25,8 26,10 26,12 C30,14 32,18 32,23 L34,28 L10,28 L12,23 C12,18 14,14 18,12 Z"
            fill={COLORS.danger}
          />
          <Circle cx="22" cy="30" r="2.5" fill={COLORS.danger} />
        </G>

        {/* Floating Pill Bubble (Top Right) */}
        <G transform="translate(245, 75)">
          <Circle cx="22" cy="22" r="22" fill={COLORS.white} stroke={COLORS.mintDark} strokeWidth="2" />
          {/* Pill Capsule */}
          <G transform="translate(12, 14) rotate(-35)">
            <Rect x="0" y="0" width="12" height="18" rx="6" fill={COLORS.brand} />
            <Rect x="0" y="9" width="12" height="9" rx="0" fill={COLORS.accent} />
          </G>
        </G>

        {/* Left Character: Elderly Patient */}
        {/* Head */}
        <Circle cx="118" cy="115" r="20" fill="#E2BA9E" />
        {/* Hair (soft grey/white curly hair) */}
        <Path
          d="M98,115 C98,100 106,90 120,90 C134,90 140,100 140,112 C135,108 128,106 122,108 C115,108 108,110 98,115 Z"
          fill="#D4DED9"
        />
        {/* Gentle spectacles */}
        <Circle cx="112" cy="116" r="5" fill="none" stroke={COLORS.brand} strokeWidth="1.8" />
        <Circle cx="124" cy="116" r="5" fill="none" stroke={COLORS.brand} strokeWidth="1.8" />
        <Line x1="117" y1="116" x2="119" y2="116" stroke={COLORS.brand} strokeWidth="1.8" />
        {/* Body (Soft teal/mint sweater) */}
        <Path
          d="M96,145 C96,135 106,132 120,132 C134,132 142,135 142,145 L145,215 L92,215 Z"
          fill={COLORS.accent}
        />
        {/* Walking Cane (Left hand support) */}
        <Path
          d="M86,170 C86,160 76,160 76,168 L76,230"
          fill="none"
          stroke={COLORS.deep}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Right Character: Caring Caregiver */}
        {/* Head */}
        <Circle cx="195" cy="108" r="19" fill="#F0C5AC" />
        {/* Hair (neat dark ponytail) */}
        <Path
          d="M178,108 C178,94 186,86 198,86 C212,86 218,96 216,112 C210,106 200,104 195,106 Z"
          fill={COLORS.deep}
        />
        <Circle cx="217" cy="116" r="7" fill={COLORS.deep} />
        {/* Body (Brand green caregiver scrubs) */}
        <Path
          d="M172,138 C172,128 182,125 196,125 C210,125 220,128 220,138 L224,215 L170,215 Z"
          fill={COLORS.brand}
        />

        {/* Connected Hands in the middle */}
        <Path
          d="M136,170 C146,178 152,180 162,175"
          fill="none"
          stroke="#E2BA9E"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Caregiver supportive arm sleeve */}
        <Path
          d="M190,140 C175,152 165,165 162,175"
          fill="none"
          stroke={COLORS.brand}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Patient arm sleeve */}
        <Path
          d="M125,140 C132,152 135,162 138,172"
          fill="none"
          stroke={COLORS.accent}
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Ground grounding baseline */}
        <Line x1="60" y1="230" x2="260" y2="230" stroke={COLORS.mintDark} strokeWidth="3" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
