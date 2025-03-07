import React from "react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export function Benefits() {
  const navigate = useNavigate();
  
  const benefits = [
    {
      title: "Ensure Information Accuracy",
      description: "Only provide information from sources that have been validated by your organization."
    },
    {
      title: "Save Valuable Time",
      description: "Instantly find relevant information without sifting through multiple documents or websites."
    },
    {
      title: "Improve Decision Making",
      description: "Access evidence-based information quickly to support clinical and operational decisions."
    },
    {
      title: "Enhance Collaboration",
      description: "Share validated information easily with colleagues through the email functionality."
    },
  ];

  return (
    <section id="benefits" className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center md:flex-row md:space-x-10">
          <div className="mb-12 md:mb-0 md:w-1/2">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">Benefits for Healthcare Professionals</h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex">
                  <div className="mr-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="font-medium"
                onClick={() => navigate("/signup")}
              >
                Start Using MediVault AI
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="overflow-hidden rounded-lg bg-white shadow-lg">
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between rounded-md bg-blue-50 p-3">
                  <div className="flex items-center">
                    <div className="mr-3 h-10 w-10 flex-shrink-0 rounded-full bg-blue-100"></div>
                    <div>
                      <div className="h-2.5 w-24 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="h-2.5 w-12 rounded bg-gray-200"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 h-6 w-6 flex-shrink-0 rounded-full bg-blue-100"></div>
                    <div className="flex-1 space-y-1 rounded-lg bg-gray-100 p-3">
                      <div className="h-2 w-3/4 rounded bg-gray-300"></div>
                      <div className="h-2 w-full rounded bg-gray-300"></div>
                      <div className="h-2 w-5/6 rounded bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 h-6 w-6 flex-shrink-0 rounded-full bg-green-100"></div>
                    <div className="flex-1 space-y-1 rounded-lg bg-gray-100 p-3">
                      <div className="h-2 w-full rounded bg-gray-300"></div>
                      <div className="h-2 w-4/5 rounded bg-gray-300"></div>
                      <div className="h-2 w-3/4 rounded bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg bg-blue-50 p-3">
                    <div className="mb-2 h-2 w-1/3 rounded bg-blue-200"></div>
                    <div className="space-y-1">
                      <div className="h-2 w-full rounded bg-blue-200"></div>
                      <div className="h-2 w-full rounded bg-blue-200"></div>
                      <div className="h-2 w-3/4 rounded bg-blue-200"></div>
                    </div>
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
