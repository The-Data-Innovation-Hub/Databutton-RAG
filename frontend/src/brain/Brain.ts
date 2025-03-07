import {
  AddUrlData,
  AddUrlError,
  BatchIndexAllData,
  BatchIndexAllError,
  BatchIndexAllParams,
  BatchIndexDocumentsData,
  BatchIndexDocumentsError,
  BatchIndexDocumentsParams,
  BatchIndexUrlsData,
  BatchIndexUrlsError,
  BatchIndexUrlsParams,
  BodyUploadDocument,
  ChatData,
  ChatError,
  ChatRequest,
  CheckHealthData,
  DeleteDocumentData,
  DeleteDocumentError,
  DeleteDocumentParams,
  DeleteUrlData,
  DeleteUrlError,
  DeleteUrlParams,
  EmailRequest,
  ExportConversationAsPdfData,
  ExportConversationAsPdfError,
  GetContentMetricsData,
  GetDocumentContentData,
  GetDocumentContentError,
  GetDocumentContentParams,
  GetDocumentData,
  GetDocumentError,
  GetDocumentParams,
  GetQueryHistoryData,
  GetQueryHistoryError,
  GetQueryHistoryParams,
  GetQueryStatsData,
  GetQueryStatsError,
  GetQueryStatsParams,
  GetUrlData,
  GetUrlError,
  GetUrlParams,
  IndexDocumentData,
  IndexDocumentError,
  IndexDocumentParams,
  IndexUrlData,
  IndexUrlError,
  IndexUrlParams,
  ListCategoriesData,
  ListDocumentsData,
  ListDocumentsError,
  ListDocumentsParams,
  ListUrlCategoriesData,
  ListUrlsData,
  ListUrlsError,
  ListUrlsParams,
  LogQueryData,
  LogQueryError,
  PDFExportRequest,
  QueryMetrics,
  SearchData,
  SearchError,
  SearchRequest,
  SendChatSummaryData,
  SendChatSummaryError,
  URLCreateRequest,
  UpdateDocumentData,
  UpdateDocumentError,
  UpdateDocumentParams,
  UpdateDocumentRequest,
  UpdateURLRequest,
  UpdateUrlData,
  UpdateUrlError,
  UpdateUrlParams,
  UploadDocumentData,
  UploadDocumentError,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:pdf_export, dbtn/hasAuth
   * @name export_conversation_as_pdf
   * @summary Export Conversation As Pdf
   * @request POST:/routes/export-pdf
   */
  export_conversation_as_pdf = (data: PDFExportRequest, params: RequestParams = {}) =>
    this.request<ExportConversationAsPdfData, ExportConversationAsPdfError>({
      path: `/routes/export-pdf`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name chat
   * @summary Chat
   * @request POST:/routes/chat
   */
  chat = (data: ChatRequest, params: RequestParams = {}) =>
    this.request<ChatData, ChatError>({
      path: `/routes/chat`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get detailed metrics for all documents and URLs in the knowledge base
   *
   * @tags dbtn/module:content_analysis, dbtn/hasAuth
   * @name get_content_metrics
   * @summary Get Content Metrics
   * @request GET:/routes/content-analysis/metrics
   */
  get_content_metrics = (params: RequestParams = {}) =>
    this.request<GetContentMetricsData, any>({
      path: `/routes/content-analysis/metrics`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:email_api, dbtn/hasAuth
   * @name send_chat_summary
   * @summary Send Chat Summary
   * @request POST:/routes/send-chat-summary
   */
  send_chat_summary = (data: EmailRequest, params: RequestParams = {}) =>
    this.request<SendChatSummaryData, SendChatSummaryError>({
      path: `/routes/send-chat-summary`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Extract text, chunk, and generate embeddings for a document
   *
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name index_document
   * @summary Index Document
   * @request POST:/routes/embeddings/index/document/{document_id}
   */
  index_document = ({ documentId, ...query }: IndexDocumentParams, params: RequestParams = {}) =>
    this.request<IndexDocumentData, IndexDocumentError>({
      path: `/routes/embeddings/index/document/${documentId}`,
      method: "POST",
      ...params,
    });

  /**
   * @description Scrape, chunk, and generate embeddings for a URL
   *
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name index_url
   * @summary Index Url
   * @request POST:/routes/embeddings/index/url/{url_id}
   */
  index_url = ({ urlId, ...query }: IndexUrlParams, params: RequestParams = {}) =>
    this.request<IndexUrlData, IndexUrlError>({
      path: `/routes/embeddings/index/url/${urlId}`,
      method: "POST",
      ...params,
    });

  /**
   * @description Index all documents for a user
   *
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name batch_index_documents
   * @summary Batch Index Documents
   * @request POST:/routes/embeddings/batch/documents
   */
  batch_index_documents = (query: BatchIndexDocumentsParams, params: RequestParams = {}) =>
    this.request<BatchIndexDocumentsData, BatchIndexDocumentsError>({
      path: `/routes/embeddings/batch/documents`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Index all URLs for a user
   *
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name batch_index_urls
   * @summary Batch Index Urls
   * @request POST:/routes/embeddings/batch/urls
   */
  batch_index_urls = (query: BatchIndexUrlsParams, params: RequestParams = {}) =>
    this.request<BatchIndexUrlsData, BatchIndexUrlsError>({
      path: `/routes/embeddings/batch/urls`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Index all documents and URLs for a user
   *
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name batch_index_all
   * @summary Batch Index All
   * @request POST:/routes/embeddings/batch/all
   */
  batch_index_all = (query: BatchIndexAllParams, params: RequestParams = {}) =>
    this.request<BatchIndexAllData, BatchIndexAllError>({
      path: `/routes/embeddings/batch/all`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Search for relevant chunks based on a query
   *
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name search
   * @summary Search
   * @request POST:/routes/embeddings/search
   */
  search = (data: SearchRequest, params: RequestParams = {}) =>
    this.request<SearchData, SearchError>({
      path: `/routes/embeddings/search`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Log query metrics for analytics
   *
   * @tags dbtn/module:analytics, dbtn/hasAuth
   * @name log_query
   * @summary Log Query
   * @request POST:/routes/log-query
   */
  log_query = (data: QueryMetrics, params: RequestParams = {}) =>
    this.request<LogQueryData, LogQueryError>({
      path: `/routes/log-query`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get paginated query history for the current user
   *
   * @tags dbtn/module:analytics, dbtn/hasAuth
   * @name get_query_history
   * @summary Get Query History
   * @request GET:/routes/queries
   */
  get_query_history = (query: GetQueryHistoryParams, params: RequestParams = {}) =>
    this.request<GetQueryHistoryData, GetQueryHistoryError>({
      path: `/routes/queries`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get aggregated query statistics for visualization
   *
   * @tags dbtn/module:analytics, dbtn/hasAuth
   * @name get_query_stats
   * @summary Get Query Stats
   * @request GET:/routes/stats
   */
  get_query_stats = (query: GetQueryStatsParams, params: RequestParams = {}) =>
    this.request<GetQueryStatsData, GetQueryStatsError>({
      path: `/routes/stats`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Add a new validated URL with metadata
   *
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name add_url
   * @summary Add Url
   * @request POST:/routes/urls
   */
  add_url = (data: URLCreateRequest, params: RequestParams = {}) =>
    this.request<AddUrlData, AddUrlError>({
      path: `/routes/urls`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all URLs added by the user
   *
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name list_urls
   * @summary List Urls
   * @request GET:/routes/urls
   */
  list_urls = (query: ListUrlsParams, params: RequestParams = {}) =>
    this.request<ListUrlsData, ListUrlsError>({
      path: `/routes/urls`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific URL's metadata
   *
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name get_url
   * @summary Get Url
   * @request GET:/routes/urls/{url_id}
   */
  get_url = ({ urlId, ...query }: GetUrlParams, params: RequestParams = {}) =>
    this.request<GetUrlData, GetUrlError>({
      path: `/routes/urls/${urlId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a URL's metadata
   *
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name update_url
   * @summary Update Url
   * @request PUT:/routes/urls/{url_id}
   */
  update_url = ({ urlId, ...query }: UpdateUrlParams, data: UpdateURLRequest, params: RequestParams = {}) =>
    this.request<UpdateUrlData, UpdateUrlError>({
      path: `/routes/urls/${urlId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a URL
   *
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name delete_url
   * @summary Delete Url
   * @request DELETE:/routes/urls/{url_id}
   */
  delete_url = ({ urlId, ...query }: DeleteUrlParams, params: RequestParams = {}) =>
    this.request<DeleteUrlData, DeleteUrlError>({
      path: `/routes/urls/${urlId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description List all URL categories used by the user
   *
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name list_url_categories
   * @summary List Url Categories
   * @request GET:/routes/urls/categories/list
   */
  list_url_categories = (params: RequestParams = {}) =>
    this.request<ListUrlCategoriesData, any>({
      path: `/routes/urls/categories/list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Upload a document with its content and metadata
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name upload_document
   * @summary Upload Document
   * @request POST:/routes/documents
   */
  upload_document = (data: BodyUploadDocument, params: RequestParams = {}) =>
    this.request<UploadDocumentData, UploadDocumentError>({
      path: `/routes/documents`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description List all documents uploaded by the user
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/documents
   */
  list_documents = (query: ListDocumentsParams, params: RequestParams = {}) =>
    this.request<ListDocumentsData, ListDocumentsError>({
      path: `/routes/documents`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific document's metadata
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name get_document
   * @summary Get Document
   * @request GET:/routes/documents/{document_id}
   */
  get_document = ({ documentId, ...query }: GetDocumentParams, params: RequestParams = {}) =>
    this.request<GetDocumentData, GetDocumentError>({
      path: `/routes/documents/${documentId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a document's metadata
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name update_document
   * @summary Update Document
   * @request PUT:/routes/documents/{document_id}
   */
  update_document = (
    { documentId, ...query }: UpdateDocumentParams,
    data: UpdateDocumentRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateDocumentData, UpdateDocumentError>({
      path: `/routes/documents/${documentId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a document and its content
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/documents/{document_id}
   */
  delete_document = ({ documentId, ...query }: DeleteDocumentParams, params: RequestParams = {}) =>
    this.request<DeleteDocumentData, DeleteDocumentError>({
      path: `/routes/documents/${documentId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get a specific document's content
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name get_document_content
   * @summary Get Document Content
   * @request GET:/routes/documents/{document_id}/content
   */
  get_document_content = ({ documentId, ...query }: GetDocumentContentParams, params: RequestParams = {}) =>
    this.request<GetDocumentContentData, GetDocumentContentError>({
      path: `/routes/documents/${documentId}/content`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all categories used by the user
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name list_categories
   * @summary List Categories
   * @request GET:/routes/documents/categories/list
   */
  list_categories = (params: RequestParams = {}) =>
    this.request<ListCategoriesData, any>({
      path: `/routes/documents/categories/list`,
      method: "GET",
      ...params,
    });
}
