import React from "react";

interface Props {
  totalQueries: number;
  avgProcessingTime?: number;
  confidenceDistribution: Record<string, number>;
}

export function RAGPerformanceCard({ totalQueries, avgProcessingTime, confidenceDistribution }: Props) {
  // If no data, display a message
  if (totalQueries === 0 || !confidenceDistribution || Object.keys(confidenceDistribution).length === 0) {
    // Return a card with a message
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-medium mb-4">RAG Performance Summary</h3>
        <p className="text-gray-500">No performance data available yet</p>
      </div>
    );
  }
  // Calculate high confidence percentage
  const highConfidenceCount = confidenceDistribution["HIGH CONFIDENCE"] || 0;
  const moderateConfidenceCount = confidenceDistribution["MODERATE CONFIDENCE"] || 0;
  const lowConfidenceCount = confidenceDistribution["LOW CONFIDENCE"] || 0;
  const insufficientDataCount = confidenceDistribution["INSUFFICIENT DATA"] || 0;
  
  const highConfidencePercentage = totalQueries > 0 ? (highConfidenceCount / totalQueries) * 100 : 0;
  const moderateConfidencePercentage = totalQueries > 0 ? (moderateConfidenceCount / totalQueries) * 100 : 0;
  const lowConfidencePercentage = totalQueries > 0 ? (lowConfidenceCount / totalQueries) * 100 : 0;
  const insufficientDataPercentage = totalQueries > 0 ? (insufficientDataCount / totalQueries) * 100 : 0;
  
  // Calculate RAG performance score (simple weighted average)
  const ragScore = totalQueries > 0 ?
    (highConfidencePercentage * 1.0 + moderateConfidencePercentage * 0.7 + lowConfidencePercentage * 0.3) / 100 : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">RAG Performance Summary</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-indigo-600 mb-1">Total Queries</p>
          <p className="text-2xl font-bold">{totalQueries.toLocaleString()}</p>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-indigo-600 mb-1">Avg. Response Time</p>
          <p className="text-2xl font-bold">{avgProcessingTime ? `${(avgProcessingTime / 1000).toFixed(2)}s` : 'N/A'}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">RAG Performance Score</span>
          <span className="text-sm font-medium">{(ragScore * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getScoreColor(ragScore)}`} 
            style={{ width: `${ragScore * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-green-600">High Confidence</span>
            <span className="text-xs font-medium text-green-600">{highConfidencePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${highConfidencePercentage}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-blue-600">Moderate Confidence</span>
            <span className="text-xs font-medium text-blue-600">{moderateConfidencePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${moderateConfidencePercentage}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-yellow-600">Low Confidence</span>
            <span className="text-xs font-medium text-yellow-600">{lowConfidencePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${lowConfidencePercentage}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Insufficient Data</span>
            <span className="text-xs font-medium text-gray-600">{insufficientDataPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: `${insufficientDataPercentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return 'bg-green-500';
  if (score >= 0.6) return 'bg-blue-500';
  if (score >= 0.4) return 'bg-yellow-500';
  return 'bg-red-500';
}
