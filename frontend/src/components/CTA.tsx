import React from "react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-6 text-3xl font-bold text-white">
          Ready to transform how your organization accesses healthcare information?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90">
          Join healthcare organizations that trust MediVault AI to provide reliable, evidence-based information at their fingertips.
        </p>
        <Button 
          size="lg" 
          variant="secondary" 
          className="font-medium"
          onClick={() => navigate("/signup")}
        >
          Get Started Today
        </Button>
      </div>
    </section>
  );
}
