import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthPageWrapper } from "../components/AuthPageWrapper";
import { ToasterProvider } from "../components/ToasterProvider";
import { useAnalyticsStore } from "../utils/analytics-store";
import { QueryHistoryTable } from "../components/QueryHistoryTable";
import { ConfidenceChart } from "../components/ConfidenceChart";
import { SourceTypesChart } from "../components/SourceTypesChart";
import { QueryTrendsChart } from "../components/QueryTrendsChart";
import { TopQueriesTable } from "../components/TopQueriesTable";
import { RAGPerformanceCard } from "../components/RAGPerformanceCard";
import { Button } from "../components/Button";

export default function Analytics() {
  return (
    <AuthPageWrapper>
      <ToasterProvider />
      <AnalyticsContent />
    </AuthPageWrapper>
  );
}

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { queryHistory, queryStats, isLoading, error, fetchQueryHistory, fetchQueryStats } = useAnalyticsStore();
  
  useEffect(() => {
    // Load query stats on component mount
    fetchQueryStats(timeRange);
    fetchQueryHistory(currentPage, 10);
  }, []);
  
  // Update data when time range changes
  const handleTimeRangeChange = (days: number) => {
    setTimeRange(days);
    fetchQueryStats(days);
  };
  
  // Handle page change for query history
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchQueryHistory(page, 10);
  };
  
  // Refresh data
  const handleRefresh = () => {
    fetchQueryStats(timeRange);
    fetchQueryHistory(currentPage, 10);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <Button
                variant={timeRange === 7 ? "default" : "outline"}
                className="text-sm"
                onClick={() => handleTimeRangeChange(7)}
              >
                Last 7 Days
              </Button>
              <Button
                variant={timeRange === 30 ? "default" : "outline"}
                className="text-sm"
                onClick={() => handleTimeRangeChange(30)}
              >
                Last 30 Days
              </Button>
              <Button
                variant={timeRange === 90 ? "default" : "outline"}
                className="text-sm"
                onClick={() => handleTimeRangeChange(90)}
              >
                Last 90 Days
              </Button>
            </div>
            
            <Button
              variant="outline"
              className="text-sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {queryStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <RAGPerformanceCard
                  totalQueries={queryStats.total_queries}
                  avgProcessingTime={queryStats.avg_processing_time}
                  confidenceDistribution={queryStats.confidence_distribution}
                />
                
                <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                  <QueryTrendsChart dailyQueryCounts={queryStats.daily_query_counts} />
                </div>
              </div>
            )}

            {queryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <ConfidenceChart confidenceDistribution={queryStats.confidence_distribution} />
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <SourceTypesChart sourceTypeDistribution={queryStats.source_type_distribution} />
                </div>
              </div>
            )}

            {queryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <TopQueriesTable topQueries={queryStats.top_queries} />
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">RAG Quality Metrics</h3>
                    <p className="text-sm text-gray-500">Key metrics for evaluating retrieval quality</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Average Semantic Score</p>
                      <div className="flex items-end">
                        <span className="text-2xl font-bold mr-1">
                          {calculateAverageSemanticScore(queryHistory?.data || [])}
                        </span>
                        <span className="text-gray-500 text-sm">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Average Sources</p>
                      <div className="flex items-end">
                        <span className="text-2xl font-bold mr-1">
                          {calculateAverageSources(queryHistory?.data || [])}
                        </span>
                        <span className="text-gray-500 text-sm">per query</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Hallucination Rate</p>
                      <div className="flex items-end">
                        <span className="text-2xl font-bold mr-1">
                          {calculateHallucinationRate(queryHistory?.data || [])}
                        </span>
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                      <div className="flex items-end">
                        <span className="text-2xl font-bold mr-1">
                          {calculateSuccessRate(queryHistory?.data || [])}
                        </span>
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {queryHistory && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <QueryHistoryTable
                  queryHistory={queryHistory.data}
                  totalCount={queryHistory.total_count}
                  page={queryHistory.page}
                  pageSize={queryHistory.page_size}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Utility functions for calculating metrics
function calculateAverageSemanticScore(queryHistory: any[]): string {
  if (!queryHistory.length) return "0";
  
  const validScores = queryHistory.filter(q => q.avg_semantic_score !== null && q.avg_semantic_score !== undefined);
  if (!validScores.length) return "0";
  
  const avgScore = validScores.reduce((sum, q) => sum + (q.avg_semantic_score || 0), 0) / validScores.length;
  return (avgScore * 100).toFixed(1);
}

function calculateAverageSources(queryHistory: any[]): string {
  if (!queryHistory.length) return "0";
  
  const avgSources = queryHistory.reduce((sum, q) => sum + (q.num_sources || 0), 0) / queryHistory.length;
  return avgSources.toFixed(1);
}

function calculateHallucinationRate(queryHistory: any[]): string {
  if (!queryHistory.length) return "0";
  
  const hallucinationCount = queryHistory.filter(q => q.hallucination_detected).length;
  return ((hallucinationCount / queryHistory.length) * 100).toFixed(1);
}

function calculateSuccessRate(queryHistory: any[]): string {
  if (!queryHistory.length) return "0";
  
  const successCount = queryHistory.filter(q => 
    q.confidence_level === "HIGH CONFIDENCE" || q.confidence_level === "MODERATE CONFIDENCE"
  ).length;
  
  return ((successCount / queryHistory.length) * 100).toFixed(1);
}
