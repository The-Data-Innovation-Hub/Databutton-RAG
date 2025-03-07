import React from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthPageWrapper } from "../components/AuthPageWrapper";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { Benefits } from "../components/Benefits";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";

export default function App() {
  return (
    <AuthPageWrapper>
      <AppContent />
    </AuthPageWrapper>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-100 py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">MediVault AI</h1>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Benefits
            </a>
          </nav>
          <div className="flex space-x-4">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  className="text-sm"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
                <Button 
                  className="text-sm" 
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
              </>
            ) : (
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
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
