import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { Button } from "./Button";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentsList } from "./DocumentsList";
import brain from "brain";
import { toast } from "sonner";

function DocumentIndexingButton({ onIndexingComplete }: { onIndexingComplete: () => void }) {
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStats, setIndexingStats] = useState<any>(null);

  const handleBatchIndex = async () => {
    try {
      setIsIndexing(true);
      setIndexingStats(null);
      
      // Show toast that indexing has started
      toast.info("Starting document indexing process...");
      
      // Call the batch indexing endpoint
      const response = await brain.batch_index_documents();
      const results = await response.json();
      
      // Set the indexing stats
      setIndexingStats(results);
      
      // Show success toast
      toast.success("Document indexing completed successfully");
      
      // Call the callback to refresh the document list
      onIndexingComplete();
    } catch (error) {
      console.error("Document indexing failed:", error);
      toast.error("Document indexing failed. Please try again.");
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="mb-4">
      <Button 
        className="w-full" 
        onClick={handleBatchIndex}
        disabled={isIndexing}
      >
        {isIndexing ? "Indexing Documents..." : "Re-index All Documents"}
      </Button>
      
      {indexingStats && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <h4 className="font-semibold mb-2">Indexing Results:</h4>
          
          <ul className="list-disc pl-5">
            <li>Total Documents: {indexingStats.total}</li>
            <li>Newly Indexed: {indexingStats.indexed}</li>
            <li>Already Indexed (Skipped): {indexingStats.skipped}</li>
            <li>Failed: {indexingStats.failed}</li>
          </ul>
          
          {indexingStats.failed > 0 && indexingStats.errors && (
            <div className="mt-2">
              <p className="font-medium text-red-600">Errors:</p>
              <ul className="list-disc pl-5 text-red-600">
                {indexingStats.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  upload_date: string;
  user_id: string;
  category: string | null;
  indexed?: boolean;
  chunk_count?: number;
}

export function DocumentManager() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = selectedCategory ? { category: selectedCategory } : {};
      const response = await brain.list_documents(queryParams);
      const data = await response.json();
      
      // Debug logging
      console.log("Documents data received:", data.documents);
      console.log("Documents with indexed status:", data.documents?.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        indexed: doc.indexed
      })));
      
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const response = await brain.list_categories();
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchCategories();
    }
  }, [user, selectedCategory]);

  // Refresh documents periodically to update indexing status
  useEffect(() => {
    // Check if any documents are not indexed
    const hasUnindexedDocuments = documents.some(doc => doc.indexed === false);
    
    // Only set up interval if there are unindexed documents and we're not in upload mode
    if (hasUnindexedDocuments && !showUploader && user) {
      const intervalId = setInterval(() => {
        fetchDocuments();
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [documents, showUploader, user]);

  // Handle document upload completion
  const handleUploadComplete = () => {
    setShowUploader(false);
    fetchDocuments();
    fetchCategories();
    
    // Show a toast notification that indexing is in progress
    toast.info("Document uploaded successfully. Indexing in progress...");
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      console.log(`Attempting to delete document with ID: ${documentId}`);
      await brain.delete_document({ documentId });
      // Update the documents list
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Error deleting document:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Detailed error:', errorMessage);
      toast.error("Failed to delete the document. Please try again.");
    }
  };

  // Handle document category update
  const handleUpdateCategory = async (documentId: string, category: string) => {
    if (!user) return;
    
    try {
      await brain.update_document({ document_id: documentId }, { category });
      // Update the documents list
      setDocuments(documents.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, category };
        }
        return doc;
      }));
      // Refresh categories if needed
      if (!categories.includes(category)) {
        fetchCategories();
      }
    } catch (err) {
      console.error("Error updating document category:", err);
      setError("Failed to update document category. Please try again.");
    }
  };

  // Calculate total documents and storage used
  const totalDocuments = documents.length;
  const totalStorageBytes = documents.reduce((total, doc) => total + doc.size, 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-medium">Your Documents</h3>
          <p className="text-sm text-gray-500">
            {totalDocuments} document{totalDocuments !== 1 ? "s" : ""} ({totalStorageMB} MB)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-gray-700 focus:border-primary focus:outline-none focus:ring-primary"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => setShowUploader(true)}>
            Upload Document
          </Button>
        </div>
      </div>

      {showUploader ? (
        <DocumentUploader onComplete={handleUploadComplete} onCancel={() => setShowUploader(false)} />
      ) : (
        <>
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 text-gray-700">Re-index Documents</h4>
            <p className="text-xs text-gray-500 mb-2">If documents show "Unknown" status, use this button to update their indexing status:</p>
            <DocumentIndexingButton onIndexingComplete={fetchDocuments} />
          </div>
          <DocumentsList 
            documents={documents} 
            categories={categories}
            isLoading={isLoading} 
            onDelete={handleDeleteDocument}
            onUpdateCategory={handleUpdateCategory}
          />
        </>
      )}
    </div>
  );
}
