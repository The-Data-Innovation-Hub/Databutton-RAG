export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: ChatMessage[];
}

export interface RankingInfo {
  semantic_score?: number;  // Similarity to query
  recency_score?: number;   // How recent the content is
  credibility_score?: number; // Source credibility
  category_score?: number;  // Category relevance
  composite_score: number;  // Final weighted score
}

export interface SourceMetadata {
  upload_date?: string;  // For documents
  added_date?: string;   // For URLs
  publication_date?: string;
  credibility_rating?: number;
  category?: string;
}

export interface Source {
  // Core identification fields
  document_id?: string;
  document_name?: string;
  url_id?: string;
  url_title?: string;
  excerpt: string;
  source_type?: "document" | "url";
  
  // Individual scores
  score?: number;              // Overall composite score
  semantic_score?: number;     // Semantic relevance to query
  credibility_score?: number;  // Source credibility rating
  recency_score?: number;      // How recent the information is
  category_score?: number;     // Relevance to requested categories
  
  // Legacy and additional data
  ranking_info?: RankingInfo;   // Original ranking info structure
  metadata?: SourceMetadata;    // Additional metadata
}

export interface ChatResponse {
  message: string;
  confidence_level?: string;
  sources: Source[];
}

export interface EmailDialogState {
  isOpen: boolean;
  recipientEmail: string;
  subject: string;
  includeTimestamp: boolean;
}

export const confidenceLevels = {
  "HIGH CONFIDENCE": {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "✓",
    description: "Information is consistent across multiple authoritative sources"
  },
  "MODERATE CONFIDENCE": {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "!",
    description: "Limited but reliable information is available"
  },
  "LOW CONFIDENCE": {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "⚠",
    description: "Information is limited, outdated, or from lower quality sources"
  },
  "INSUFFICIENT DATA": {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "?",
    description: "Repository lacks adequate information to form a conclusion"
  }
};
