import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { Button } from "./Button";
import brain from "brain";

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

export function URLForm({ onComplete, onCancel }: Props) {
  const { user } = useAuth();
  const [urlData, setUrlData] = useState({
    url: "",
    title: "",
    description: "",
    category: "",
    credibility_score: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!urlData.url) {
      newErrors.url = "URL is required";
    } else if (!validateUrl(urlData.url)) {
      newErrors.url = "Please enter a valid URL (e.g., https://example.com)";
    }

    if (!urlData.title) {
      newErrors.title = "Title is required";
    }

    if (urlData.credibility_score < 1 || urlData.credibility_score > 5) {
      newErrors.credibility_score = "Credibility score must be between 1 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUrlData(prev => ({
      ...prev,
      [name]: name === "credibility_score" ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("No authenticated user found");
      setErrors({ general: "Authentication error. Please log out and log back in." });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await brain.add_url({
        url: urlData.url,
        title: urlData.title,
        description: urlData.description || null,
        category: urlData.category || null,
        credibility_score: urlData.credibility_score
      });

      onComplete();
    } catch (err) {
      console.error("Error adding URL:", err);
      if (err instanceof Error) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "Failed to add URL. Please try again." });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Add Validated URL</h3>

      {errors.general && (
        <div className="mb-4 bg-red-50 p-4 rounded-md text-red-700 text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="url">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="url"
              name="url"
              className={`w-full rounded-md ${errors.url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
              placeholder="https://example.com"
              value={urlData.url}
              onChange={handleChange}
            />
            {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`w-full rounded-md ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
              placeholder="Website Title"
              value={urlData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="Brief description of the website content..."
              value={urlData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="E.g., Research, Clinical, Education"
              value={urlData.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="credibility_score">
              Credibility Score (1-5) <span className="text-red-500">*</span>
            </label>
            <select
              id="credibility_score"
              name="credibility_score"
              className={`w-full rounded-md ${errors.credibility_score ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
              value={urlData.credibility_score}
              onChange={handleChange}
            >
              <option value="1">1 - Low Credibility</option>
              <option value="2">2 - Somewhat Credible</option>
              <option value="3">3 - Moderately Credible</option>
              <option value="4">4 - Highly Credible</option>
              <option value="5">5 - Extremely Credible</option>
            </select>
            {errors.credibility_score && <p className="mt-1 text-sm text-red-600">{errors.credibility_score}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing URL..." : "Save URL"}
          </Button>
        </div>
      </form>
    </div>
  );
}
