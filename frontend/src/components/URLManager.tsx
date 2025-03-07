import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { Button } from "./Button";
import { URLForm } from "./URLForm";
import { URLList } from "./URLList";
import brain from "brain";
import { toast } from "sonner";

function URLIndexingButton({ onIndexingComplete }: { onIndexingComplete: () => void }) {
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStats, setIndexingStats] = useState<any>(null);

  const handleBatchIndex = async () => {
    try {
      setIsIndexing(true);
      setIndexingStats(null);
      
      // Show toast that indexing has started
      toast.info("Starting URL indexing process...");
      
      // Call the batch indexing endpoint
      const response = await brain.batch_index_urls();
      const results = await response.json();
      
      // Set the indexing stats
      setIndexingStats(results);
      
      // Show success toast
      toast.success("URL indexing completed successfully");
      
      // Call the callback to refresh the URL list
      onIndexingComplete();
    } catch (error) {
      console.error("URL indexing failed:", error);
      toast.error("URL indexing failed. Please try again.");
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
        {isIndexing ? "Indexing URLs..." : "Re-index All URLs"}
      </Button>
      
      {indexingStats && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <h4 className="font-semibold mb-2">Indexing Results:</h4>
          
          <ul className="list-disc pl-5">
            <li>Total URLs: {indexingStats.total}</li>
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

export interface URL {
  id: string;
  url: string;
  title: string;
  description: string | null;
  category: string | null;
  credibility_score: number | null;
  added_date: string;
  user_id: string;
  indexed?: boolean;
  chunk_count?: number;
}

export function URLManager() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<URL[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch URLs
  const fetchUrls = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = selectedCategory ? { category: selectedCategory } : {};
      const response = await brain.list_urls(queryParams);
      const data = await response.json();
      
      // Debug logging
      console.log("URLs data received:", data.urls);
      console.log("URLs with indexed status:", data.urls?.map(url => ({
        id: url.id,
        title: url.title,
        indexed: url.indexed
      })));
      
      setUrls(data.urls || []);
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setError("Failed to load URLs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const response = await brain.list_url_categories();
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching URL categories:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchUrls();
      fetchCategories();
    }
  }, [user, selectedCategory]);

  // Refresh URLs periodically to update indexing status
  useEffect(() => {
    // Check if any URLs are not indexed
    const hasUnindexedUrls = urls.some(url => url.indexed === false);
    
    // Only set up interval if there are unindexed URLs and we're not in form mode
    if (hasUnindexedUrls && !showForm && user) {
      const intervalId = setInterval(() => {
        fetchUrls();
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [urls, showForm, user]);

  // Handle URL add completion
  const handleAddComplete = () => {
    setShowForm(false);
    fetchUrls();
    fetchCategories();
    toast.info("URL added successfully. Indexing in progress...");
  };

  // Handle URL deletion
  const handleDeleteUrl = async (urlId: string) => {
    if (!user || !window.confirm("Are you sure you want to delete this URL?")) return;
    
    try {
      await brain.delete_url({ urlId });  // Fixed parameter name
      // Update the URLs list
      setUrls(urls.filter(url => url.id !== urlId));
      toast.success("URL deleted successfully");
    } catch (err) {
      console.error("Error deleting URL:", err);
      toast.error("Failed to delete the URL. Please try again.");
    }
  };

  // Handle URL update
  const handleUpdateUrl = async (urlId: string, data: {
    title?: string;
    description?: string;
    category?: string;
    credibility_score?: number;
  }) => {
    if (!user) return;
    
    try {
      await brain.update_url({ urlId }, data);  // Fixed parameter name
      // Update the URLs list
      setUrls(urls.map(url => {
        if (url.id === urlId) {
          return { ...url, ...data };
        }
        return url;
      }));
      
      // Refresh categories if needed
      if (data.category && !categories.includes(data.category)) {
        fetchCategories();
      }
      
      toast.success("URL updated successfully");
    } catch (err) {
      console.error("Error updating URL:", err);
      toast.error("Failed to update the URL. Please try again.");
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-medium">Your URLs</h3>
          <p className="text-sm text-gray-500">
            {urls.length} URL{urls.length !== 1 ? "s" : ""}
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
          <Button onClick={() => setShowForm(true)}>
            Add URL
          </Button>
        </div>
      </div>

      {showForm ? (
        <URLForm onComplete={handleAddComplete} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 text-gray-700">Re-index URLs</h4>
            <p className="text-xs text-gray-500 mb-2">If URLs show "Unknown" status, use this button to update their indexing status:</p>
            <URLIndexingButton onIndexingComplete={fetchUrls} />
          </div>
          <URLList 
            urls={urls} 
            categories={categories}
            isLoading={isLoading} 
            onDelete={handleDeleteUrl}
            onUpdate={handleUpdateUrl}
          />
        </>
      )}
    </div>
  );
}
