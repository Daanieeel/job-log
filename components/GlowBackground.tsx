import { glowHueColor, type ColorScheme, type GlowHue } from '@/lib/theme/tokens';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import Svg, { Circle, Defs, FeGaussianBlur, Filter, G, RadialGradient, Stop } from 'react-native-svg';

/** A white background washes color out far more than a near-black one, so light mode needs more opacity, not less, for the same hue to read as bold. */
function opacityFor(scheme: ColorScheme, base: number): number {
  return scheme === 'light' ? base + 0.36 : base;
}

const HEIGHT = 360;
/** Virtual coordinate space the blobs are laid out in; the SVG stretches this to fill the width. */
const VB_WIDTH = 400;
const VB_HEIGHT = HEIGHT;
const BLUR_STD_DEVIATION = 34;

type Blob = { hue: GlowHue; cx: number; cy: number; r: number; opacity: number };

// Concentrated toward the bottom of the container (cy close to HEIGHT) so this reads as glowing
// up from behind the tab bar. Radii keep margin from HEIGHT's top edge for the same reason they
// used to keep margin from the bottom — so the blur's spread fully completes before it's clipped.
const BLOBS: Blob[] = [
  { hue: 'violet', cx: 200, cy: 340, r: 190, opacity: 0.56 },
  { hue: 'cobalt', cx: 40, cy: 320, r: 130, opacity: 0.45 },
  { hue: 'amber', cx: 350, cy: 300, r: 120, opacity: 0.41 },
  { hue: 'cyan', cx: 150, cy: 230, r: 95, opacity: 0.39 },
];

/**
 * Bold, multi-hue mesh glow — violet (brand) dominant, blended with cobalt, amber, and cyan
 * accents. Anchored to the bottom of its screen (callers position it with `bottom-0`) so it
 * glows up from behind the translucent native tab bar. Purely decorative.
 *
 * Built from true SVG radial gradients, not `expo-linear-gradient` circles — a *linear* gradient
 * clipped into a circle only fades top-to-bottom, leaving hard-edged color on the left/right sides.
 * A Gaussian blur filter (`FeGaussianBlur`) is layered on top of the already-radial blobs for an
 * actual soft, atmospheric look rather than just a mathematically-correct-but-still-crisp fade.
 * Every blob's radius keeps generous margin inside `HEIGHT` so the blur's spread fully completes
 * before the container ends — no clipped seam.
 */
export function GlowBackground({ className }: { className?: string }) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? 'light';

  return (
    <View pointerEvents="none" className={className} style={{ height: HEIGHT }}>
      <Svg
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        preserveAspectRatio="none">
        <Defs>
          {BLOBS.map((blob, index) => (
            <RadialGradient
              key={blob.hue}
              id={`glow-${index}`}
              cx={blob.cx}
              cy={blob.cy}
              r={blob.r}
              gradientUnits="userSpaceOnUse">
              <Stop
                offset="0"
                stopColor={glowHueColor(scheme, blob.hue)}
                stopOpacity={opacityFor(scheme, blob.opacity)}
              />
              <Stop offset="1" stopColor={glowHueColor(scheme, blob.hue)} stopOpacity={0} />
            </RadialGradient>
          ))}
          <Filter id="glowBlur" x="-100%" y="-100%" width="400%" height="400%">
            <FeGaussianBlur stdDeviation={BLUR_STD_DEVIATION} />
          </Filter>
        </Defs>
        <G filter="url(#glowBlur)">
          {BLOBS.map((blob, index) => (
            <Circle
              key={blob.hue}
              cx={blob.cx}
              cy={blob.cy}
              r={blob.r}
              fill={`url(#glow-${index})`}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
