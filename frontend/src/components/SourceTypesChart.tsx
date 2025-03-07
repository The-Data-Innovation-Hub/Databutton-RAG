import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Props {
  sourceTypeDistribution: Record<string, number>;
}

export function SourceTypesChart({ sourceTypeDistribution }: Props) {
  // Handle empty data case
  if (!sourceTypeDistribution || Object.keys(sourceTypeDistribution).length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-4">Source Type Distribution</h3>
        <p className="text-gray-500">No source type data available yet</p>
      </div>
    );
  }
  // Transform the source type distribution data for the chart
  const data = Object.entries(sourceTypeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
    value: count,
  }));

  // Colors for the pie chart
  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="w-full h-full min-h-[300px]">
      <h3 className="text-lg font-medium mb-4">Source Type Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} sources`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
