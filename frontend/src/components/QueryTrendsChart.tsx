import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DailyCount {
  date: string;
  count: number;
}

interface Props {
  dailyQueryCounts: DailyCount[];
}

export function QueryTrendsChart({ dailyQueryCounts }: Props) {
  // Handle empty data case
  if (!dailyQueryCounts || dailyQueryCounts.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium mb-4">Query Volume Over Time</h3>
        <p className="text-gray-500">No query trend data available yet</p>
      </div>
    );
  }
  // Format dates for readability
  const formattedData = dailyQueryCounts.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    count: item.count
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <h3 className="text-lg font-medium mb-4">Query Volume Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="Number of Queries"
            stroke="#4F46E5"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
