import React from "react";
import { Button } from "../components/Button";
import { useNavigate, Link } from "react-router-dom";
import { useCurrentUser } from "app";

export function Header() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isLoggedIn = !!user;

  return (
    <header className="border-b border-gray-100 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">MediVault AI</h1>
        </div>
        <nav className="hidden space-x-8 md:flex">
          {!isLoggedIn ? (
            // Non-authenticated nav links
            <>
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Benefits
              </a>
            </>
          ) : (
            // Authenticated nav links
            <>
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/documents" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Documents
              </Link>
              <Link to="/chat" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                AI Chat
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/analytics" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Query Analytics
              </Link>
              <Link to="/content-analysis" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Content Analysis
              </Link>
            </>
          )}
        </nav>
        <div className="flex space-x-4">
          {!isLoggedIn ? (
            // Non-authenticated buttons
            <>
              <Button 
                variant="outline" 
                className="text-sm"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
              <Button 
                className="text-sm" 
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
            </>
          ) : (
            // Authenticated buttons
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => navigate("/logout")}
            >
              Log Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
