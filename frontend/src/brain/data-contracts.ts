/** AnalyticsResponse */
export interface AnalyticsResponse {
  /** Data */
  data: QueryMetrics[];
  /** Total Count */
  total_count: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
}

/** Body_upload_document */
export interface BodyUploadDocument {
  /**
   * File
   * @format binary
   */
  file: File;
  /** Category */
  category?: string | null;
}

/** ChatRequest */
export interface ChatRequest {
  /** Message */
  message: string;
  /**
   * Conversation History
   * @default []
   */
  conversation_history?: AppApisChatChatMessage[] | null;
}

/** DocumentResponse */
export interface DocumentResponse {
  /** Id */
  id: string;
  /** Filename */
  filename: string;
  /** Content Type */
  content_type: string;
  /** Size */
  size: number;
  /** Upload Date */
  upload_date: string;
  /** User Id */
  user_id: string;
  /** Category */
  category?: string | null;
  /** Indexed */
  indexed?: boolean | null;
  /** Chunk Count */
  chunk_count?: number | null;
}

/** DocumentsListResponse */
export interface DocumentsListResponse {
  /** Documents */
  documents: DocumentResponse[];
}

/** EmailRequest */
export interface EmailRequest {
  /**
   * Recipient Email
   * @format email
   */
  recipient_email: string;
  /** Subject */
  subject: string;
  /** Content */
  content: string;
  /**
   * Include Timestamp
   * @default true
   */
  include_timestamp?: boolean;
}

/** EmailResponse */
export interface EmailResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** PDFExportRequest */
export interface PDFExportRequest {
  /** Conversation */
  conversation: AppApisPdfExportChatMessage[];
  /**
   * Title
   * @default "MediVault AI Consultation"
   */
  title?: string | null;
  /**
   * Include Timestamp
   * @default true
   */
  include_timestamp?: boolean | null;
}

/** QueryMetrics */
export interface QueryMetrics {
  /** Query */
  query: string;
  /** Timestamp */
  timestamp: string;
  /** User Id */
  user_id: string;
  /** Confidence Level */
  confidence_level?: string | null;
  /** Response Length */
  response_length: number;
  /** Processing Time Ms */
  processing_time_ms?: number | null;
  /** Num Sources */
  num_sources: number;
  /** Avg Semantic Score */
  avg_semantic_score?: number | null;
  /** Avg Credibility Score */
  avg_credibility_score?: number | null;
  /** Avg Recency Score */
  avg_recency_score?: number | null;
  /** Source Types */
  source_types: Record<string, number>;
  /** Hallucination Detected */
  hallucination_detected?: boolean | null;
  /**
   * Tags
   * @default []
   */
  tags?: string[];
}

/** QueryStatsResponse */
export interface QueryStatsResponse {
  /** Total Queries */
  total_queries: number;
  /** Avg Processing Time */
  avg_processing_time?: number | null;
  /**
   * Confidence Distribution
   * @default {}
   */
  confidence_distribution?: Record<string, number>;
  /**
   * Source Type Distribution
   * @default {}
   */
  source_type_distribution?: Record<string, number>;
  /**
   * Top Queries
   * @default []
   */
  top_queries?: object[];
  /**
   * Daily Query Counts
   * @default []
   */
  daily_query_counts?: object[];
}

/** SearchRequest */
export interface SearchRequest {
  /** Query */
  query: string;
  /**
   * Top K
   * @default 5
   */
  top_k?: number;
  /** Document Ids */
  document_ids?: string[] | null;
  /** Url Ids */
  url_ids?: string[] | null;
  /** Categories */
  categories?: string[] | null;
}

/** SearchResponse */
export interface SearchResponse {
  /** Results */
  results: SearchResult[];
}

/** SearchResult */
export interface SearchResult {
  /** Id */
  id: string;
  /** Text */
  text: string;
  /** Metadata */
  metadata: object;
  /** Score */
  score: number;
  /** Source Type */
  source_type: string;
  /** Semantic Score */
  semantic_score: number;
  /** Recency Score */
  recency_score?: number | null;
  /** Credibility Score */
  credibility_score?: number | null;
  /** Category Score */
  category_score?: number | null;
}

/** URLCreateRequest */
export interface URLCreateRequest {
  /**
   * Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  url: string;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /** Credibility Score */
  credibility_score?: number | null;
}

/** URLResponse */
export interface URLResponse {
  /** Id */
  id: string;
  /** Url */
  url: string;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /** Credibility Score */
  credibility_score?: number | null;
  /** Added Date */
  added_date: string;
  /** User Id */
  user_id: string;
  /** Indexed */
  indexed?: boolean | null;
  /** Chunk Count */
  chunk_count?: number | null;
}

/** URLsListResponse */
export interface URLsListResponse {
  /** Urls */
  urls: URLResponse[];
}

/** UpdateDocumentRequest */
export interface UpdateDocumentRequest {
  /** Category */
  category?: string | null;
}

/** UpdateURLRequest */
export interface UpdateURLRequest {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Category */
  category?: string | null;
  /** Credibility Score */
  credibility_score?: number | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** ChatMessage */
export interface AppApisChatChatMessage {
  /** Role */
  role: string;
  /** Content */
  content: string;
}

/** ChatMessage */
export interface AppApisPdfExportChatMessage {
  /** Role */
  role: string;
  /** Content */
  content: string;
  /** Sources */
  sources?: any[] | null;
}

export type CheckHealthData = HealthResponse;

export type ExportConversationAsPdfData = any;

export type ExportConversationAsPdfError = HTTPValidationError;

export type ChatData = any;

export type ChatError = HTTPValidationError;

export type GetContentMetricsData = any;

export type SendChatSummaryData = EmailResponse;

export type SendChatSummaryError = HTTPValidationError;

export interface IndexDocumentParams {
  /** Document Id */
  documentId: string;
}

export type IndexDocumentData = any;

export type IndexDocumentError = HTTPValidationError;

export interface IndexUrlParams {
  /** Url Id */
  urlId: string;
}

export type IndexUrlData = any;

export type IndexUrlError = HTTPValidationError;

export interface BatchIndexDocumentsParams {
  /**
   * Force
   * @default false
   */
  force?: boolean;
}

export type BatchIndexDocumentsData = any;

export type BatchIndexDocumentsError = HTTPValidationError;

export interface BatchIndexUrlsParams {
  /**
   * Force
   * @default false
   */
  force?: boolean;
}

export type BatchIndexUrlsData = any;

export type BatchIndexUrlsError = HTTPValidationError;

export interface BatchIndexAllParams {
  /**
   * Force
   * @default false
   */
  force?: boolean;
}

export type BatchIndexAllData = any;

export type BatchIndexAllError = HTTPValidationError;

export type SearchData = SearchResponse;

export type SearchError = HTTPValidationError;

export type LogQueryData = any;

export type LogQueryError = HTTPValidationError;

export interface GetQueryHistoryParams {
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Page Size
   * @default 20
   */
  page_size?: number;
}

export type GetQueryHistoryData = AnalyticsResponse;

export type GetQueryHistoryError = HTTPValidationError;

export interface GetQueryStatsParams {
  /**
   * Days
   * @default 30
   */
  days?: number;
}

export type GetQueryStatsData = QueryStatsResponse;

export type GetQueryStatsError = HTTPValidationError;

export type AddUrlData = URLResponse;

export type AddUrlError = HTTPValidationError;

export interface ListUrlsParams {
  /** Category */
  category?: string | null;
}

export type ListUrlsData = URLsListResponse;

export type ListUrlsError = HTTPValidationError;

export interface GetUrlParams {
  /** Url Id */
  urlId: string;
}

export type GetUrlData = URLResponse;

export type GetUrlError = HTTPValidationError;

export interface UpdateUrlParams {
  /** Url Id */
  urlId: string;
}

export type UpdateUrlData = URLResponse;

export type UpdateUrlError = HTTPValidationError;

export interface DeleteUrlParams {
  /** Url Id */
  urlId: string;
}

export type DeleteUrlData = any;

export type DeleteUrlError = HTTPValidationError;

/** Response List Url Categories */
export type ListUrlCategoriesData = string[];

export type UploadDocumentData = DocumentResponse;

export type UploadDocumentError = HTTPValidationError;

export interface ListDocumentsParams {
  /** Category */
  category?: string | null;
}

export type ListDocumentsData = DocumentsListResponse;

export type ListDocumentsError = HTTPValidationError;

export interface GetDocumentParams {
  /** Document Id */
  documentId: string;
}

export type GetDocumentData = DocumentResponse;

export type GetDocumentError = HTTPValidationError;

export interface UpdateDocumentParams {
  /** Document Id */
  documentId: string;
}

export type UpdateDocumentData = DocumentResponse;

export type UpdateDocumentError = HTTPValidationError;

export interface DeleteDocumentParams {
  /** Document Id */
  documentId: string;
}

export type DeleteDocumentData = any;

export type DeleteDocumentError = HTTPValidationError;

export interface GetDocumentContentParams {
  /** Document Id */
  documentId: string;
}

export type GetDocumentContentData = any;

export type GetDocumentContentError = HTTPValidationError;

/** Response List Categories */
export type ListCategoriesData = string[];
