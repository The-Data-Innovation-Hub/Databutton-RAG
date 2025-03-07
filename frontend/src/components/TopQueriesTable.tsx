import React from "react";

interface TopQuery {
  query: string;
  count: number;
}

interface Props {
  topQueries: TopQuery[];
}

export function TopQueriesTable({ topQueries }: Props) {
  // Handle empty data case
  if (!topQueries || topQueries.length === 0) {
    return (
      <div className="w-full h-full min-h-[100px] flex flex-col items-start justify-center">
        <h3 className="text-lg font-medium mb-4">Top Queries</h3>
        <p className="text-gray-500">No query data available yet</p>
      </div>
    );
  }
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">Top Queries</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Query
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Count
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Frequency
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topQueries.map((item, index) => {
              // Calculate total queries
              const totalQueries = topQueries.reduce((sum, q) => sum + q.count, 0);
              const percentage = totalQueries > 0 ? (item.count / totalQueries) * 100 : 0;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {item.query}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2">{percentage.toFixed(1)}%</span>
                      <div className="relative h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-indigo-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
