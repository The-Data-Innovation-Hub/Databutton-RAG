import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { Button } from "./Button";
import brain from "brain";
import { API_URL } from "app";


interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

export function DocumentUploader({ onComplete, onCancel }: Props) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Debug authentication status
    console.log("DocumentUploader useEffect - Auth status:", { 
      user, 
      userId: user?.uid,
      emailVerified: user?.emailVerified
    });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected");
      return;
    }
    
    if (!user) {
      console.error("No authenticated user found");
      setError("Authentication error. Please log out and log back in.");
      return;
    }
    
    if (!user.uid) {
      console.error("User object has no uid", user);
      setError("Invalid user profile. Please log out and log back in.");
      return;
    }
    
    console.log("Starting upload with user:", { 
      uid: user.uid, 
      email: user.email,
      emailVerified: user.emailVerified
    });

    // Check file size (limit to 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("File type not supported. Please upload PDF, DOC, DOCX, TXT, or MD files.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log("Starting upload process using brain client");
      
      // Set up progress tracking simulation since brain client doesn't expose progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Simulate progress up to 90% (last 10% reserved for server processing)
          if (prev < 90) {
            return prev + 5;
          }
          return prev;
        });
      }, 200);
      
      try {
        // Pass file and category directly to the brain client
        // The brain client will handle creating the FormData internally
        const response = await brain.upload_document({
          file: selectedFile,
          category: category || null
        });
        const responseData = await response.json();
        
        console.log("Upload completed successfully:", responseData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Delay slightly to allow backend processing
        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (error) {
        clearInterval(progressInterval);
        console.error("Error during upload:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Upload failed. Please try again.");
        }
        setIsUploading(false);
      }
    } catch (err) {
      console.error("Error setting up document upload:", err);
      if (err instanceof Error) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError("Upload failed. Please try again.");
      }
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Upload Document</h3>

      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
        />

        {selectedFile ? (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-green-500 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-green-600 font-medium text-sm mb-1">
              File selected: {selectedFile.name}
            </p>
            <p className="text-gray-500 text-xs">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-700 font-medium mb-1">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-gray-500 text-xs">
              Supported formats: PDF, DOC, DOCX, TXT, MD (Max 10MB)
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category (optional)
        </label>
        <input
          type="text"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="Enter a category name"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {isUploading && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-1 text-gray-500">
            {uploadProgress < 100 ? "Uploading..." : "Processing... This may take a few moments."}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (uploadProgress < 100 ? "Uploading..." : "Processing...") : "Upload"}
        </Button>
      </div>
    </div>
  );
}
