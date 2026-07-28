import { useMemo } from "react";
import {
  Gamepad2, Tv, Music, MessageSquare, MonitorPlay,
  Crown, Headphones, Zap, Star, Shield, Radio, Youtube,
  Layers, Wifi, Sparkles, Trophy,
} from "lucide-react";

const ICONS = [
  Gamepad2, Tv, Music, MessageSquare, MonitorPlay,
  Crown, Headphones, Zap, Star, Shield, Radio, Youtube,
  Layers, Wifi, Sparkles, Trophy,
];

const COLORS = [
  "rgba(0,255,204,VAL)",   // teal
  "rgba(176,38,255,VAL)",  // purple
  "rgba(255,0,128,VAL)",   // pink
  "rgba(255,255,255,VAL)", // white
];

interface IconItem {
  id: number;
  IconComp: React.ElementType;
  left: string;
  delay: string;
  duration: string;
  size: number;
  color: string;
  rot: number;
}

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function FallingIconsBackground() {
  const items = useMemo<IconItem[]>(() => {
    return Array.from({ length: 35 }, (_, i) => {
      const r = (offset: number) => seededRand(i * 17 + offset);
      const alpha = (0.12 + r(3) * 0.2).toFixed(2);
      const colorTemplate = COLORS[Math.floor(r(4) * COLORS.length)];
      return {
        id: i,
        IconComp: ICONS[Math.floor(r(0) * ICONS.length)],
        left: `${(r(1) * 100).toFixed(1)}%`,
        delay: `${-(r(2) * 20).toFixed(1)}s`,  // negative delay = already mid-fall on load
        duration: `${(12 + r(5) * 16).toFixed(1)}s`,
        size: Math.floor(14 + r(6) * 28),
        color: colorTemplate.replace("VAL", alpha),
        rot: Math.floor((r(7) - 0.5) * 60),
      };
    });
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {items.map(({ id, IconComp, left, delay, duration, size, color, rot }) => (
          <div
            key={id}
            style={{
              position: "absolute",
              left,
              top: 0,
              animationName: "iconFall",
              animationDuration: duration,
              animationDelay: delay,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              // CSS custom property for rotation inside keyframe
              ["--rot" as string]: `${rot}deg`,
            }}
          >
            <IconComp
              style={{ width: size, height: size, color, display: "block" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
