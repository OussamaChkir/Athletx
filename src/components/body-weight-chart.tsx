import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { theme } from "@/lib/theme";
import { formatWeight, parseDateKey } from "@/lib/weight";

const GOAL_GOLD = "#e8c84a";

export interface ChartPoint {
  date: string;
  value: number;
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function niceTicks(min: number, max: number, count = 3): number[] {
  const span = Math.max(max - min, 0.5);
  const raw = span / (count - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  const step = nice * mag;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step * 0.01; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks.length >= 2 ? ticks : [min, max];
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short" });
}

export function BodyWeightChart({
  points,
  goal,
  width,
  height = 168,
}: {
  points: ChartPoint[];
  goal: number | null;
  width: number;
  height?: number;
}) {
  const padL = 36;
  const padR = 28;
  const padT = 10;
  const padB = 28;
  const chartW = Math.max(width - padL - padR, 1);
  const chartH = height - padT - padB;

  const layout = useMemo(() => {
    if (width <= 0 || points.length === 0) return null;

    const values = points.map((p) => p.value);
    if (goal != null) values.push(goal);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const pad = Math.max((maxV - minV) * 0.18, 0.4);
    const ticks = niceTicks(minV - pad, maxV + pad, 3);
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const ySpan = Math.max(yMax - yMin, 0.1);

    const times = points.map((p) => parseDateKey(p.date).getTime());
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const tSpan = Math.max(tMax - tMin, 1);

    const mapped = points.map((p, i) => {
      const t = times[i];
      const x =
        points.length === 1
          ? padL + chartW * 0.88
          : padL + ((t - tMin) / tSpan) * chartW;
      const y = padT + ((yMax - p.value) / ySpan) * chartH;
      return { x, y, ...p };
    });

    const line = smoothPath(mapped);
    const last = mapped[mapped.length - 1];
    const fill = `${line} L ${last.x} ${padT + chartH} L ${mapped[0].x} ${padT + chartH} Z`;
    const goalY =
      goal != null ? padT + ((yMax - goal) / ySpan) * chartH : null;

    const months: { x: number; label: string }[] = [];
    const seen = new Set<string>();
    for (const p of mapped) {
      const label = monthLabel(parseDateKey(p.date));
      if (seen.has(label)) continue;
      seen.add(label);
      months.push({ x: p.x, label });
    }
    if (months.length === 1) {
      months[0].x = padL + chartW / 2;
    }

    return { mapped, line, fill, ticks, yMax, ySpan, goalY, months };
  }, [points, goal, width, chartW, chartH]);

  if (!layout) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Log weigh-ins to see your trend</Text>
      </View>
    );
  }

  const { mapped, line, fill, ticks, yMax, ySpan, goalY, months } = layout;
  const last = mapped[mapped.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.neon} stopOpacity="0.28" />
          <Stop offset="1" stopColor={theme.neon} stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {ticks.map((tick) => {
        const y = padT + ((yMax - tick) / ySpan) * chartH;
        return (
          <SvgText
            key={`t-${tick}`}
            x={0}
            y={y + 4}
            fill={theme.muted}
            fontSize={11}
            fontWeight="600"
          >
            {formatWeight(tick, tick % 1 === 0 ? 0 : 1)}
          </SvgText>
        );
      })}

      {goalY != null && goal != null ? (
        <>
          <Line
            x1={padL}
            y1={goalY}
            x2={width - 8}
            y2={goalY}
            stroke={GOAL_GOLD}
            strokeWidth={1.5}
            strokeDasharray="5 6"
          />
          <SvgText
            x={width - 4}
            y={goalY + 4}
            fill={GOAL_GOLD}
            fontSize={11}
            fontWeight="800"
            textAnchor="end"
          >
            {formatWeight(goal, goal % 1 === 0 ? 0 : 1)}
          </SvgText>
        </>
      ) : null}

      <Path d={fill} fill="url(#weightFill)" />
      <Path d={line} fill="none" stroke={theme.neon} strokeWidth={2.4} />

      <Circle cx={last.x} cy={last.y} r={6} fill={theme.neon} />
      <Circle cx={last.x} cy={last.y} r={3.2} fill={theme.background} />

      {months.map((m) => (
        <SvgText
          key={m.label}
          x={m.x}
          y={height - 6}
          fill={theme.muted}
          fontSize={12}
          fontWeight="600"
          textAnchor="middle"
        >
          {m.label}
        </SvgText>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: theme.muted,
    fontSize: 13,
  },
});
