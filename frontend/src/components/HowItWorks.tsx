import React from "react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Trusted Documents",
      description:
        "Add your organization's validated healthcare documents to create your knowledge base."
    },
    {
      number: "02",
      title: "Add Verified Website Links",
      description:
        "Include links to approved external healthcare resources to expand your knowledge repository."
    },
    {
      number: "03",
      title: "Ask Questions Naturally",
      description:
        "Use the AI chat interface to ask questions in plain language about any healthcare topic."
    },
    {
      number: "04",
      title: "Receive Evidence-Based Answers",
      description:
        "Get professionally formatted responses backed by your trusted documents and websites."
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            MediVault AI streamlines access to validated healthcare information through a simple four-step process.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-14 top-7 hidden h-0.5 w-full -translate-y-1/2 transform bg-gray-200 lg:block"></div>
              )}
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
