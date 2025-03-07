import React, { useState } from "react";
import { API_URL } from "app";
import { toast } from "sonner";
import { Document } from "./DocumentManager";
import { Button } from "./Button";
import brain from "brain";

interface Props {
  documents: Document[];
  categories: string[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

export function DocumentsList({ documents, categories, isLoading, onDelete, onUpdateCategory }: Props) {
  // Calculate debug stats
  const totalDocuments = documents.length;
  const indexedTrue = documents.filter(doc => doc.indexed === true).length;
  const indexedFalse = documents.filter(doc => doc.indexed === false).length;
  const indexedUndefined = documents.filter(doc => doc.indexed === undefined).length;
  const indexedOther = totalDocuments - indexedTrue - indexedFalse - indexedUndefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-primary mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-2 text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="h-12 w-12 text-gray-400 mx-auto mb-2"
          xmlns="http://www.w3.org/2000/svg"
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
        <p className="text-gray-700 font-medium">No documents found</p>
        <p className="text-gray-500 text-sm mt-1">Upload a document to get started</p>
      </div>
    );
  }

  const startCategoryEdit = (document: Document) => {
    setEditingId(document.id);
    setEditCategory(document.category || "");
    setNewCategory("");
  };

  const cancelCategoryEdit = () => {
    setEditingId(null);
    setEditCategory("");
    setNewCategory("");
  };

  const saveCategoryEdit = (documentId: string) => {
    const finalCategory = newCategory || editCategory;
    onUpdateCategory(documentId, finalCategory);
    cancelCategoryEdit();
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) {
      return (
        <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 384 512">
          <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm250.2-143.7c-12.2-12-47-8.7-64.4-6.5-17.2-10.5-28.7-25-36.8-46.3 3.9-16.1 10.1-40.6 5.4-56-4.2-26.2-37.8-23.6-42.6-5.9-4.4 16.1-.4 38.5 7 67.1-10 23.9-24.9 56-35.4 74.4-20 10.3-47 26.2-51 46.2-3.3 15.8 26 55.2 76.1-31.2 22.4-7.4 46.8-16.5 68.4-20.1 18.9 10.2 41 17 55.8 17 25.5 0 28-28.2 17.5-38.7zm-198.1 77.8c5.1-13.7 24.5-29.5 30.4-35-19 30.3-30.4 35.7-30.4 35zm81.6-190.6c7.4 0 6.7 32.1 1.8 40.8-4.4-13.9-4.3-40.8-1.8-40.8zm-24.4 136.6c9.7-16.9 18-37 24.7-54.7 8.3 15.1 18.9 27.2 30.1 35.5-20.8 4.3-38.9 13.1-54.8 19.2zm131.6-5s-5 6-37.3-7.8c35.1-2.6 40.9 5.4 37.3 7.8z"/>
        </svg>
      );
    } else if (contentType.includes('word') || contentType.includes('doc')) {
      return (
        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 384 512">
          <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm57.1 120H305c7.7 0 13.4 7.1 11.7 14.7l-38 168c-1.2 5.5-6.1 9.3-11.7 9.3h-38c-5.5 0-10.3-3.8-11.6-9.1-25.8-103.5-20.8-81.2-25.6-110.5h-.5c-1.1 14.3-2.4 17.4-25.6 110.5-1.3 5.3-6.1 9.1-11.6 9.1H117c-5.6 0-10.5-3.9-11.7-9.4l-37.8-168c-1.7-7.5 4-14.6 11.7-14.6h24.5c5.7 0 10.7 4 11.8 9.7 15.6 78 20.1 109.5 21 122.2 1.6-10.2 7.3-32.7 29.4-122.7 1.3-5.4 6.1-9.1 11.7-9.1h29.1c5.6 0 10.4 3.8 11.7 9.2 24 100.4 28.8 124 29.6 129.4-.2-11.2-2.6-17.8 21.6-129.2 1-5.6 5.9-9.5 11.5-9.5zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/>
        </svg>
      );
    } else if (contentType.includes('text') || contentType.includes('markdown')) {
      return (
        <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 384 512">
          <path d="M384 121.941V128H256V0h6.059c6.365 0 12.47 2.529 16.971 7.029l97.941 97.941A24.005 24.005 0 0 1 384 121.941zM248 160c-13.2 0-24-10.8-24-24V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248zM123.206 400.505a5.4 5.4 0 0 1-7.633.246l-64.866-60.812a5.4 5.4 0 0 1 0-7.879l64.866-60.812a5.4 5.4 0 0 1 7.633.246l19.579 20.885a5.4 5.4 0 0 1-.372 7.747L101.65 336l40.763 35.874a5.4 5.4 0 0 1 .372 7.747l-19.579 20.884zm51.295 50.479l-27.453-7.97a5.402 5.402 0 0 1-3.681-6.692l61.44-211.626a5.402 5.402 0 0 1 6.692-3.681l27.452 7.97a5.4 5.4 0 0 1 3.68 6.692l-61.44 211.626a5.397 5.397 0 0 1-6.69 3.681zm160.792-111.045l-64.866 60.812a5.4 5.4 0 0 1-7.633-.246l-19.58-20.885a5.4 5.4 0 0 1 .372-7.747L284.35 336l-40.763-35.874a5.4 5.4 0 0 1-.372-7.747l19.58-20.885a5.4 5.4 0 0 1 7.633-.246l64.866 60.812a5.4 5.4 0 0 1-.001 7.879z"/>
        </svg>
      );
    } else {
      return (
        <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 384 512">
          <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48z"/>
        </svg>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
  };

  return (
    <div>
      {/* Debug information */}
      <div className="mb-4 p-3 bg-gray-100 rounded-md text-sm">
        <h4 className="font-medium mb-1">Debug Information:</h4>
        <ul className="list-disc pl-5">
          <li>Total documents: {totalDocuments}</li>
          <li>With indexed=true: {indexedTrue}</li>
          <li>With indexed=false: {indexedFalse}</li>
          <li>With indexed=undefined: {indexedUndefined}</li>
          <li>With other indexed value: {indexedOther}</li>
        </ul>
      </div>
      
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => (
            <tr key={document.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.content_type)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {document.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {document.content_type}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {document.indexed === false ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-4 w-4 text-amber-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-amber-700">Indexing...</span>
                    <span className="text-xs text-gray-500 ml-2">(Value: {String(document.indexed)})</span>
                  </div>
                ) : document.indexed === true ? (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700">Indexed {document.chunk_count ? `(${document.chunk_count} chunks)` : ''}</span>
                    <span className="text-xs text-gray-500 ml-2">(Value: {String(document.indexed)})</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-gray-500">Unknown</span>
                    <span className="text-xs text-gray-500 ml-2">(Value: {String(document.indexed)})</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === document.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                      <select
                        className="w-full rounded-md border-gray-300 py-1 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-primary"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__new__">+ Add new category</option>
                      </select>
                    </div>
                    
                    {editCategory === "__new__" && (
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 py-1 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-primary"
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    )}
                    
                    <div className="flex space-x-1">
                      <button
                        className="text-primary hover:text-primary-dark p-1"
                        onClick={() => saveCategoryEdit(document.id)}
                        disabled={editCategory === "__new__" && !newCategory}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700 p-1"
                        onClick={cancelCategoryEdit}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {document.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {document.category}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </span>
                    <button
                      className="ml-2 text-gray-400 hover:text-primary"
                      onClick={() => startCategoryEdit(document)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(document.upload_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatSize(document.size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-primary hover:text-primary-dark"
                  onClick={() => {
                    // Open document in a new tab with proper authentication
                    const openDocumentInNewTab = async () => {
                      // Log expected URL for debugging
                      const expectedUrl = `${API_URL}/routes/documents/${document.id}/content`;
                      console.log('Expected document URL:', expectedUrl);
                      try {
                        console.log(`Attempting to get document with ID: ${document.id}`);
                        toast.info("Opening document...");
                        
                        try {
                          // Method 1: Try using brain client (preferred way)
                          console.log("Trying brain client approach...");
                          const response = await brain.get_document_content({ documentId: document.id });
                          console.log('Brain client response:', response);
                          
                          if (!response.ok) {
                            console.error(`Brain client HTTP error! Status: ${response.status}`);
                            throw new Error(`HTTP ${response.status}`);
                          }
                          
                          const blob = await response.blob();
                          console.log('Got blob response of type:', blob.type, 'and size:', blob.size);
                          
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, '_blank');
                          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                          toast.success("Document opened successfully");
                          return;
                        } catch (brainError) {
                          console.error('Brain client approach failed:', brainError);
                          console.log('Falling back to direct fetch...');
                          
                          // Method 2: Fallback to direct URL approach
                          const directUrl = `${API_URL}/routes/documents/${document.id}/content`;
                          console.log('Trying direct URL:', directUrl);
                          
                          const link = document.createElement('a');
                          link.href = directUrl;
                          link.setAttribute('target', '_blank');
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          toast.success("Attempted to open document directly");
                        }
                      } catch (error) {
                        console.error('All document opening methods failed:', error);
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.error('Detailed error:', errorMessage);
                        toast.error(`Failed to open document: ${errorMessage}`);
                      }
                    };
                    openDocumentInNewTab();
                  }}
                >
                  View
                </button>
                <button
                  className="text-red-600 hover:text-red-900 ml-3"
                  onClick={() => onDelete(document.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
