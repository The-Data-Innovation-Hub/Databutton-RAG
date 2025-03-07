import {
  AddUrlData,
  BatchIndexAllData,
  BatchIndexDocumentsData,
  BatchIndexUrlsData,
  BodyUploadDocument,
  ChatData,
  ChatRequest,
  CheckHealthData,
  DeleteDocumentData,
  DeleteUrlData,
  EmailRequest,
  ExportConversationAsPdfData,
  GetContentMetricsData,
  GetDocumentContentData,
  GetDocumentData,
  GetQueryHistoryData,
  GetQueryStatsData,
  GetUrlData,
  IndexDocumentData,
  IndexUrlData,
  ListCategoriesData,
  ListDocumentsData,
  ListUrlCategoriesData,
  ListUrlsData,
  LogQueryData,
  PDFExportRequest,
  QueryMetrics,
  SearchData,
  SearchRequest,
  SendChatSummaryData,
  URLCreateRequest,
  UpdateDocumentData,
  UpdateDocumentRequest,
  UpdateURLRequest,
  UpdateUrlData,
  UploadDocumentData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags dbtn/module:pdf_export, dbtn/hasAuth
   * @name export_conversation_as_pdf
   * @summary Export Conversation As Pdf
   * @request POST:/routes/export-pdf
   */
  export namespace export_conversation_as_pdf {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PDFExportRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ExportConversationAsPdfData;
  }

  /**
   * No description
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name chat
   * @summary Chat
   * @request POST:/routes/chat
   */
  export namespace chat {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ChatData;
  }

  /**
   * @description Get detailed metrics for all documents and URLs in the knowledge base
   * @tags dbtn/module:content_analysis, dbtn/hasAuth
   * @name get_content_metrics
   * @summary Get Content Metrics
   * @request GET:/routes/content-analysis/metrics
   */
  export namespace get_content_metrics {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetContentMetricsData;
  }

  /**
   * No description
   * @tags dbtn/module:email_api, dbtn/hasAuth
   * @name send_chat_summary
   * @summary Send Chat Summary
   * @request POST:/routes/send-chat-summary
   */
  export namespace send_chat_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = EmailRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SendChatSummaryData;
  }

  /**
   * @description Extract text, chunk, and generate embeddings for a document
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name index_document
   * @summary Index Document
   * @request POST:/routes/embeddings/index/document/{document_id}
   */
  export namespace index_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = IndexDocumentData;
  }

  /**
   * @description Scrape, chunk, and generate embeddings for a URL
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name index_url
   * @summary Index Url
   * @request POST:/routes/embeddings/index/url/{url_id}
   */
  export namespace index_url {
    export type RequestParams = {
      /** Url Id */
      urlId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = IndexUrlData;
  }

  /**
   * @description Index all documents for a user
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name batch_index_documents
   * @summary Batch Index Documents
   * @request POST:/routes/embeddings/batch/documents
   */
  export namespace batch_index_documents {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Force
       * @default false
       */
      force?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = BatchIndexDocumentsData;
  }

  /**
   * @description Index all URLs for a user
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name batch_index_urls
   * @summary Batch Index Urls
   * @request POST:/routes/embeddings/batch/urls
   */
  export namespace batch_index_urls {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Force
       * @default false
       */
      force?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = BatchIndexUrlsData;
  }

  /**
   * @description Index all documents and URLs for a user
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name batch_index_all
   * @summary Batch Index All
   * @request POST:/routes/embeddings/batch/all
   */
  export namespace batch_index_all {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Force
       * @default false
       */
      force?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = BatchIndexAllData;
  }

  /**
   * @description Search for relevant chunks based on a query
   * @tags dbtn/module:embeddings, dbtn/hasAuth
   * @name search
   * @summary Search
   * @request POST:/routes/embeddings/search
   */
  export namespace search {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SearchRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SearchData;
  }

  /**
   * @description Log query metrics for analytics
   * @tags dbtn/module:analytics, dbtn/hasAuth
   * @name log_query
   * @summary Log Query
   * @request POST:/routes/log-query
   */
  export namespace log_query {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = QueryMetrics;
    export type RequestHeaders = {};
    export type ResponseBody = LogQueryData;
  }

  /**
   * @description Get paginated query history for the current user
   * @tags dbtn/module:analytics, dbtn/hasAuth
   * @name get_query_history
   * @summary Get Query History
   * @request GET:/routes/queries
   */
  export namespace get_query_history {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetQueryHistoryData;
  }

  /**
   * @description Get aggregated query statistics for visualization
   * @tags dbtn/module:analytics, dbtn/hasAuth
   * @name get_query_stats
   * @summary Get Query Stats
   * @request GET:/routes/stats
   */
  export namespace get_query_stats {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Days
       * @default 30
       */
      days?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetQueryStatsData;
  }

  /**
   * @description Add a new validated URL with metadata
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name add_url
   * @summary Add Url
   * @request POST:/routes/urls
   */
  export namespace add_url {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = URLCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddUrlData;
  }

  /**
   * @description List all URLs added by the user
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name list_urls
   * @summary List Urls
   * @request GET:/routes/urls
   */
  export namespace list_urls {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Category */
      category?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUrlsData;
  }

  /**
   * @description Get a specific URL's metadata
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name get_url
   * @summary Get Url
   * @request GET:/routes/urls/{url_id}
   */
  export namespace get_url {
    export type RequestParams = {
      /** Url Id */
      urlId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUrlData;
  }

  /**
   * @description Update a URL's metadata
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name update_url
   * @summary Update Url
   * @request PUT:/routes/urls/{url_id}
   */
  export namespace update_url {
    export type RequestParams = {
      /** Url Id */
      urlId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateURLRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateUrlData;
  }

  /**
   * @description Delete a URL
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name delete_url
   * @summary Delete Url
   * @request DELETE:/routes/urls/{url_id}
   */
  export namespace delete_url {
    export type RequestParams = {
      /** Url Id */
      urlId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteUrlData;
  }

  /**
   * @description List all URL categories used by the user
   * @tags dbtn/module:urls, dbtn/hasAuth
   * @name list_url_categories
   * @summary List Url Categories
   * @request GET:/routes/urls/categories/list
   */
  export namespace list_url_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUrlCategoriesData;
  }

  /**
   * @description Upload a document with its content and metadata
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name upload_document
   * @summary Upload Document
   * @request POST:/routes/documents
   */
  export namespace upload_document {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyUploadDocument;
    export type RequestHeaders = {};
    export type ResponseBody = UploadDocumentData;
  }

  /**
   * @description List all documents uploaded by the user
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/documents
   */
  export namespace list_documents {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Category */
      category?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDocumentsData;
  }

  /**
   * @description Get a specific document's metadata
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name get_document
   * @summary Get Document
   * @request GET:/routes/documents/{document_id}
   */
  export namespace get_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentData;
  }

  /**
   * @description Update a document's metadata
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name update_document
   * @summary Update Document
   * @request PUT:/routes/documents/{document_id}
   */
  export namespace update_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateDocumentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateDocumentData;
  }

  /**
   * @description Delete a document and its content
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/documents/{document_id}
   */
  export namespace delete_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteDocumentData;
  }

  /**
   * @description Get a specific document's content
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name get_document_content
   * @summary Get Document Content
   * @request GET:/routes/documents/{document_id}/content
   */
  export namespace get_document_content {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDocumentContentData;
  }

  /**
   * @description List all categories used by the user
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name list_categories
   * @summary List Categories
   * @request GET:/routes/documents/categories/list
   */
  export namespace list_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCategoriesData;
  }
}
