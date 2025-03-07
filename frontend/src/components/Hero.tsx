import React from "react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center md:flex-row md:justify-between md:space-x-10">
          <div className="mb-12 md:mb-0 md:w-1/2">
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
              Your Organization's Trusted Healthcare Knowledge Repository
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              MediVault AI empowers healthcare professionals with instant access to validated information through an intelligent AI assistant that references your organization's trusted resources.
            </p>
            <div className="flex space-x-4">
              <Button 
                size="lg" 
                className="font-medium"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="font-medium"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-md bg-blue-50">
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 text-blue-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-3 border-b border-gray-100 pb-4">
                <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                <div className="h-2 w-full rounded bg-gray-200"></div>
                <div className="h-2 w-5/6 rounded bg-gray-200"></div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-blue-100"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-2 w-1/2 rounded bg-gray-200"></div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-6 w-6 flex-shrink-0 rounded-full bg-green-100"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-5/6 rounded bg-gray-200"></div>
                    <div className="h-2 w-2/3 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
