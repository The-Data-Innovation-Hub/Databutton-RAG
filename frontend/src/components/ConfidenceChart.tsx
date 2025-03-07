import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  confidenceDistribution: Record<string, number>;
}

export function ConfidenceChart({ confidenceDistribution }: Props) {
  // Handle empty data case
  if (!confidenceDistribution || Object.keys(confidenceDistribution).length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-4">Response Confidence Distribution</h3>
        <p className="text-gray-500">No confidence data available yet</p>
      </div>
    );
  }
  // Transform the confidence distribution data for the chart
  const data = Object.entries(confidenceDistribution).map(([level, count]) => ({
    name: level.replace("_", " "),
    count,
    color: getColorForConfidenceLevel(level),
  }));

  // Sort data by confidence level
  const sortOrder = ["HIGH CONFIDENCE", "MODERATE CONFIDENCE", "LOW CONFIDENCE", "INSUFFICIENT DATA"];
  data.sort((a, b) => {
    return sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name);
  });

  return (
    <div className="w-full h-full min-h-[300px]">
      <h3 className="text-lg font-medium mb-4">Response Confidence Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Number of Responses" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function getColorForConfidenceLevel(level: string): string {
  switch (level) {
    case "HIGH CONFIDENCE":
      return "#4ADE80"; // green
    case "MODERATE CONFIDENCE":
      return "#60A5FA"; // blue
    case "LOW CONFIDENCE":
      return "#FBBF24"; // yellow
    case "INSUFFICIENT DATA":
      return "#9CA3AF"; // gray
    default:
      return "#4F46E5"; // indigo (default)
  }
}
