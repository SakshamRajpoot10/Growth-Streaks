import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../../utils/theme';

interface TradingLineGraphProps {
  hourlyDistribution: Record<string, number>;
  totalSteps: number;
  mode?: 'day' | 'week' | 'month';
  weekData?: number[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRAPH_WIDTH = Math.min(SCREEN_WIDTH - 64, 380);
const GRAPH_HEIGHT = 160;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 28;
const PADDING_LEFT = 14;
const PADDING_RIGHT = 14;

export const TradingLineGraph: React.FC<TradingLineGraphProps> = ({
  hourlyDistribution = {},
  totalSteps = 0,
  mode = 'day',
  weekData = [],
}) => {
  const { colors, isDark } = useTheme();

  // Extract 24 data points (0h to 23h)
  const currentHour = new Date().getHours();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  let rawPoints: number[] = [];
  let labels: string[] = [];

  if (mode === 'day') {
    rawPoints = hours.map((hr) => {
      const stepVal = hourlyDistribution[String(hr)] || 0;
      return stepVal;
    });
    labels = ['12:00 AM', '6:00 AM', '12:00 PM', '6:00 PM', '12:00 AM'];
  } else if (mode === 'week') {
    rawPoints = weekData.length === 7 ? weekData : [0, 0, 0, 0, 0, 0, totalSteps];
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  } else {
    // Month mode
    rawPoints = [totalSteps * 0.2, totalSteps * 0.4, totalSteps * 0.6, totalSteps * 0.8, totalSteps];
    labels = ['W1', 'W2', 'W3', 'W4'];
  }

  // Calculate scaling
  const maxVal = Math.max(...rawPoints, 300);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const usableWidth = GRAPH_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const usableHeight = GRAPH_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  // Convert values into coordinates
  const coords = rawPoints.map((val, idx) => {
    const x = PADDING_LEFT + (idx / Math.max(1, rawPoints.length - 1)) * usableWidth;
    const y = PADDING_TOP + usableHeight - (val / range) * usableHeight;
    return { x, y, val };
  });

  // Build smooth Bezier curve line path (Catmull-Rom spline to Bezier)
  const buildSmoothCurve = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Catmull-Rom tangent control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    return path;
  };

  const smoothStrokePath = buildSmoothCurve(coords);

  // Closed area path for gradient fill under the trading curve
  const firstPt = coords[0];
  const lastPt = coords[coords.length - 1];
  const baselineY = PADDING_TOP + usableHeight;
  const smoothAreaPath = `${smoothStrokePath} L ${lastPt.x} ${baselineY} L ${firstPt.x} ${baselineY} Z`;

  // Active cursor point (current hour or latest point)
  const activeIndex = mode === 'day' ? Math.min(currentHour, coords.length - 1) : coords.length - 1;
  const activeCoord = coords[activeIndex] || lastPt;

  return (
    <View style={styles.container}>
      {/* Trading Header Banner */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.graphTitle, { color: colors.text }]}>
            {mode === 'day' ? "Today's Movement Curve" : mode === 'week' ? 'Weekly Movement Trend' : 'Monthly Trajectory'}
          </Text>
          <Text style={[styles.graphSubtitle, { color: colors.textSecondary }]}>
            Live Trading-Style Dynamic Cadence
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <Text style={styles.liveDot}>●</Text>
          <Text style={styles.liveText}>LIVE STREAM</Text>
        </View>
      </View>

      {/* SVG Canvas */}
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.svg}>
        <Defs>
          <LinearGradient id="tradingGreenGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#10B981" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Dotted Reference Gridlines */}
        <Line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={GRAPH_WIDTH - PADDING_RIGHT}
          y2={PADDING_TOP}
          stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeDasharray="4,4"
        />
        <Line
          x1={PADDING_LEFT}
          y1={PADDING_TOP + usableHeight * 0.5}
          x2={GRAPH_WIDTH - PADDING_RIGHT}
          y2={PADDING_TOP + usableHeight * 0.5}
          stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeDasharray="4,4"
        />
        <Line
          x1={PADDING_LEFT}
          y1={baselineY}
          x2={GRAPH_WIDTH - PADDING_RIGHT}
          y2={baselineY}
          stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
        />

        {/* Filled Gradient Area Under Curve */}
        <Path d={smoothAreaPath} fill="url(#tradingGreenGrad)" />

        {/* Smooth Neon Trading Line Stroke */}
        <Path
          d={smoothStrokePath}
          stroke="#10B981"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Live Market Cursor: Glowing Dot at Active Point */}
        {activeCoord && (
          <>
            <Circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="8"
              fill="#10B981"
              opacity="0.35"
            />
            <Circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="4.5"
              fill="#10B981"
            />
            <Circle
              cx={activeCoord.x}
              cy={activeCoord.y}
              r="2"
              fill="#FFFFFF"
            />
          </>
        )}
      </Svg>

      {/* X-Axis Time Ticker Labels */}
      <View style={styles.labelsRow}>
        {labels.map((lbl, i) => (
          <Text key={i} style={[styles.timeLabel, { color: colors.textSecondary }]}>
            {lbl}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  graphSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    fontSize: 9,
    color: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  svg: {
    marginVertical: 2,
  },
  labelsRow: {
    width: GRAPH_WIDTH - 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
