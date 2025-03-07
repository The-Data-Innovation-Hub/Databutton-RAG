import { create } from 'zustand';
import brain from 'brain';
import { toast } from 'sonner';
import { demoQueryHistory, demoQueryStats, demoContentAnalytics } from './demo-data';

// Flag to use demo data when API returns empty results
const USE_DEMO_DATA_FOR_EMPTY = true;

export interface RankingInfo {
  semantic_score?: number;  // Similarity to query
  recency_score?: number;   // How recent the content is
  credibility_score?: number; // Source credibility
  category_score?: number;  // Category relevance
  composite_score: number;  // Final weighted score
}

export interface QueryMetrics {
  query: string;
  timestamp: string;
  user_id: string;
  confidence_level?: string;
  response_length: number;
  processing_time_ms?: number;
  num_sources: number;
  avg_semantic_score?: number;
  avg_credibility_score?: number;
  avg_recency_score?: number;
  source_types: Record<string, number>;
  hallucination_detected?: boolean;
  tags: string[];
}

export interface QueryHistoryResponse {
  data: QueryMetrics[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface QueryStatsResponse {
  total_queries: number;
  avg_processing_time?: number;
  confidence_distribution: Record<string, number>;
  source_type_distribution: Record<string, number>;
  top_queries: Array<{ query: string; count: number }>;
  daily_query_counts: Array<{ date: string; count: number }>;
}

interface AnalyticsState {
  queryHistory: QueryHistoryResponse | null;
  queryStats: QueryStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchQueryHistory: (page?: number, pageSize?: number) => Promise<void>;
  fetchQueryStats: (days?: number) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  queryHistory: null,
  queryStats: null,
  isLoading: false,
  error: null,
  
  fetchQueryHistory: async (page = 1, pageSize = 20) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await brain.get_query_history({ page, page_size: pageSize });
      const data = await response.json();
      
      // If we got empty data and demo mode is enabled, use demo data
      if (USE_DEMO_DATA_FOR_EMPTY && data.data && data.data.length === 0) {
        console.log('Using demo query history data');
        set({ queryHistory: demoQueryHistory, isLoading: false });
      } else {
        set({ queryHistory: data, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching query history:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while fetching query history', 
        isLoading: false 
      });
      toast.error('Failed to load query history');
    }
  },
  
  fetchQueryStats: async (days = 30) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await brain.get_query_stats({ days });
      const data = await response.json();
      
      // If we got empty data and demo mode is enabled, use demo data
      if (USE_DEMO_DATA_FOR_EMPTY && 
          (!data.total_queries || 
           (Object.keys(data.confidence_distribution || {}).length === 0 && 
            Object.keys(data.source_type_distribution || {}).length === 0))) {
        console.log('Using demo query stats data');
        set({ queryStats: demoQueryStats, isLoading: false });
      } else {
        set({ queryStats: data, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching query stats:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while fetching query statistics', 
        isLoading: false 
      });
      toast.error('Failed to load query statistics');
    }
  },
}));
