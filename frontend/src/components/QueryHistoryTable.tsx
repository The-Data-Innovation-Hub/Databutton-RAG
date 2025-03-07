import React from "react";
import { QueryMetrics } from "../utils/analytics-store";

interface Props {
  queryHistory: QueryMetrics[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function QueryHistoryTable({ queryHistory, totalCount, page, pageSize, onPageChange }: Props) {
  // Handle empty data case
  if (!queryHistory || queryHistory.length === 0) {
    return (
      <div className="w-full h-full min-h-[100px] flex flex-col items-start justify-center">
        <h3 className="text-lg font-medium mb-4">Recent Queries</h3>
        <p className="text-gray-500">No recent queries available yet</p>
      </div>
    );
  }
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-medium mb-4">Recent Queries</h3>
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
                Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Confidence
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sources
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Avg. Scores
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queryHistory.map((query, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">
                  {query.query}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(query.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBadgeColor(
                      query.confidence_level
                    )}`}
                  >
                    {query.confidence_level || "Unknown"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {query.num_sources}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="text-xs w-20 text-gray-500">Semantic:</span>
                      <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min((query.avg_semantic_score || 0) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {query.avg_semantic_score ? (query.avg_semantic_score * 100).toFixed(0) + '%' : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs w-20 text-gray-500">Credibility:</span>
                      <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min((query.avg_credibility_score || 0) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {query.avg_credibility_score ? (query.avg_credibility_score * 100).toFixed(0) + '%' : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs w-20 text-gray-500">Recency:</span>
                      <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min((query.avg_recency_score || 0) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {query.avg_recency_score ? (query.avg_recency_score * 100).toFixed(0) + '%' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to{" "}
              <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{" "}
              <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Calculate page numbers to show (centered around current page)
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (page > 3) {
                    pageNum = page - 3 + i;
                  }
                  if (page > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={i}
                      onClick={() => onPageChange(pageNum)}
                      aria-current={page === pageNum ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function getConfidenceBadgeColor(confidence?: string): string {
  switch (confidence) {
    case "HIGH CONFIDENCE":
      return "bg-green-100 text-green-800";
    case "MODERATE CONFIDENCE":
      return "bg-blue-100 text-blue-800";
    case "LOW CONFIDENCE":
      return "bg-yellow-100 text-yellow-800";
    case "INSUFFICIENT DATA":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
