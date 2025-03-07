import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { Button } from "../components/Button";
import brain from "brain";
import { toast } from "sonner";
import { AuthPageWrapper } from "../components/AuthPageWrapper";
import { ToasterProvider } from "../components/ToasterProvider";

export default function Dashboard() {
  return (
    <AuthPageWrapper>
      <ToasterProvider />
      <DashboardContent />
    </AuthPageWrapper>
  );
}

function BatchIndexingButton() {
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStats, setIndexingStats] = useState(null);
  const [forceReindex, setForceReindex] = useState(true); // Default to true for advanced analysis

  const handleBatchIndex = async () => {
    try {
      setIsIndexing(true);
      setIndexingStats(null);
      
      // Show toast that indexing has started
      toast.info(forceReindex 
        ? "Starting advanced analysis reindexing..."
        : "Starting indexing of new content only...");
      
      // Call the batch indexing endpoint with force parameter
      const response = await brain.batch_index_all({ force: forceReindex });
      const results = await response.json();
      
      // Set the indexing stats
      setIndexingStats(results);
      
      // Show success toast
      toast.success("Batch indexing completed successfully");
    } catch (error) {
      console.error("Batch indexing failed:", error);
      toast.error("Batch indexing failed. Please try again.");
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          id="forceReindex"
          checked={forceReindex}
          onChange={(e) => setForceReindex(e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary"
        />
        <label htmlFor="forceReindex" className="text-sm text-gray-700">
          Force reindex all content for advanced analysis
        </label>
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleBatchIndex}
        disabled={isIndexing}
      >
        {isIndexing ? "Indexing..." : forceReindex ? "Reindex All Content" : "Index New Content Only"}
      </Button>
      
      {indexingStats && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <h4 className="font-semibold mb-2">Indexing Results:</h4>
          
          <div className="mb-2">
            <p className="font-medium">Documents:</p>
            <ul className="list-disc pl-5">
              <li>Total: {indexingStats.documents.total}</li>
              <li>Indexed: {indexingStats.documents.indexed}</li>
              <li>Skipped: {indexingStats.documents.skipped}</li>
              <li>Failed: {indexingStats.documents.failed}</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium">URLs:</p>
            <ul className="list-disc pl-5">
              <li>Total: {indexingStats.urls.total}</li>
              <li>Indexed: {indexingStats.urls.indexed}</li>
              <li>Skipped: {indexingStats.urls.skipped}</li>
              <li>Failed: {indexingStats.urls.failed}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Redirect if not logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">MediVault AI</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.displayName || user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <p className="text-gray-600">
            Welcome to MediVault AI. This is your dashboard where you'll be able to access all the features of the platform.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-2">Knowledge Base Indexing</h3>
          <p className="text-gray-600 mb-4">
            Process and index all your documents and URLs for AI search and advanced analysis.
          </p>
          <BatchIndexingButton />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Document Management</h3>
            <p className="text-gray-600 mb-4">
              Upload and manage your organization's documents.
            </p>
            <Button className="w-full" onClick={() => navigate('/documents')}>
              Manage Documents
            </Button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">URL Management</h3>
            <p className="text-gray-600 mb-4">
              Add and manage links to validated healthcare websites.
            </p>
            <Button className="w-full" onClick={() => navigate('/urls')}>
              Manage URLs
            </Button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">AI Chat</h3>
            <p className="text-gray-600 mb-4">
              Chat with AI to get answers from your knowledge base.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate("/chat")}
            >
              Start Chatting
            </Button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium mb-2">Content Analysis</h3>
            <p className="text-gray-600 mb-4">
              Analyze your knowledge base metrics and content quality.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate("/content-analysis")}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} MediVault AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
