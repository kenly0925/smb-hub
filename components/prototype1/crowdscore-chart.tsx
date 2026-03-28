"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const crowdScoreSeries = [
  { time: "06:57", score: 0 },
  { time: "08:03", score: 0 },
  { time: "09:20", score: 0 },
  { time: "10:43", score: 0 },
  { time: "13:15", score: 0 },
  { time: "17:30", score: 0 },
  { time: "22:00", score: 0 },
  { time: "02:20", score: 0 },
];

export function CrowdScoreChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={crowdScoreSeries}
        margin={{ top: 10, right: 12, left: -22, bottom: 0 }}
      >
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
        />
        <YAxis
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#8c92a3"
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
