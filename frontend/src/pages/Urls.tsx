import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthPageWrapper } from "../components/AuthPageWrapper";
import { URLManager } from "../components/URLManager";
import { useAuth } from "../utils/AuthContext";
import { Button } from "../components/Button";

export default function Urls() {
  return (
    <AuthPageWrapper>
      <UrlsContent />
    </AuthPageWrapper>
  );
}

function UrlsContent() {
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
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <span className="text-sm text-gray-600">
              {user?.displayName || user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">URL Management</h2>
          <p className="text-gray-600 mb-6">
            Add and manage your organization's validated healthcare website links. Add categories, credibility scores, and descriptions to organize your URLs.
          </p>
          
          <URLManager />
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
