import React, { useState } from "react";
import { URL } from "./URLManager";
import { Button } from "./Button";

interface Props {
  urls: URL[];
  categories: string[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title?: string; description?: string; category?: string; credibility_score?: number }) => void;
}

export function URLList({ urls, categories, isLoading, onDelete, onUpdate }: Props) {
  // Calculate debug stats
  const totalUrls = urls.length;
  const indexedTrue = urls.filter(url => url.indexed === true).length;
  const indexedFalse = urls.filter(url => url.indexed === false).length;
  const indexedUndefined = urls.filter(url => url.indexed === undefined).length;
  const indexedOther = totalUrls - indexedTrue - indexedFalse - indexedUndefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    title?: string;
    description?: string;
    category?: string;
    credibility_score?: number;
  }>({});

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
        <p className="mt-2 text-gray-500">Loading URLs...</p>
      </div>
    );
  }

  if (urls.length === 0) {
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
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <p className="text-gray-700 font-medium">No URLs found</p>
        <p className="text-gray-500 text-sm mt-1">Add a URL to get started</p>
      </div>
    );
  }

  const startEditing = (url: URL) => {
    setEditingId(url.id);
    setEditData({
      title: url.title,
      description: url.description || "",
      category: url.category || "",
      credibility_score: url.credibility_score || 3
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEditing = (urlId: string) => {
    onUpdate(urlId, editData);
    cancelEditing();
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === "credibility_score" ? parseInt(value, 10) : value
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCredibilityScore = (score: number | null) => {
    if (score === null) return null;
    
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-green-100 text-green-800",
      5: "bg-green-100 text-green-800",
    };
    
    const labels = {
      1: "Low",
      2: "Somewhat",
      3: "Moderate",
      4: "High",
      5: "Excellent",
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[score as 1|2|3|4|5]}`}>
        {labels[score as 1|2|3|4|5]} ({score})
      </span>
    );
  };

  return (
    <div>
      {/* Debug information */}
      <div className="mb-4 p-3 bg-gray-100 rounded-md text-sm">
        <h4 className="font-medium mb-1">Debug Information:</h4>
        <ul className="list-disc pl-5">
          <li>Total URLs: {totalUrls}</li>
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
              URL
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credibility
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Added
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {urls.map((url) => (
            <tr key={url.id} className={`hover:bg-gray-50 ${editingId === url.id ? 'bg-blue-50' : ''}`}>
              {editingId === url.id ? (
                // Editing mode
                <>
                  <td className="px-6 py-4" colSpan={5}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <div className="text-sm text-gray-500 truncate">{url.url}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          className="w-full rounded-md border-gray-300 text-sm focus:border-primary focus:ring-primary"
                          value={editData.title}
                          onChange={handleEditChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows={2}
                          className="w-full rounded-md border-gray-300 text-sm focus:border-primary focus:ring-primary"
                          value={editData.description}
                          onChange={handleEditChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            name="category"
                            className="w-full rounded-md border-gray-300 text-sm focus:border-primary focus:ring-primary"
                            value={editData.category}
                            onChange={handleEditChange}
                            list="categories"
                          />
                          <datalist id="categories">
                            {categories.map(cat => (
                              <option key={cat} value={cat} />
                            ))}
                          </datalist>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Credibility Score
                          </label>
                          <select
                            name="credibility_score"
                            className="w-full rounded-md border-gray-300 text-sm focus:border-primary focus:ring-primary"
                            value={editData.credibility_score}
                            onChange={handleEditChange}
                          >
                            <option value="1">1 - Low Credibility</option>
                            <option value="2">2 - Somewhat Credible</option>
                            <option value="3">3 - Moderately Credible</option>
                            <option value="4">4 - Highly Credible</option>
                            <option value="5">5 - Extremely Credible</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-2">
                        <Button variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                        <Button onClick={() => saveEditing(url.id)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </td>
                </>
              ) : (
                // View mode
                <>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 truncate max-w-[300px]">
                        {url.title}
                      </div>
                      <a 
                        href={url.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[300px]"
                      >
                        {url.url}
                      </a>
                      {url.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {url.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {url.indexed === false ? (
                      <div className="flex items-center">
                        <svg className="animate-spin h-4 w-4 text-amber-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-amber-700">Indexing...</span>
                        <span className="text-xs text-gray-500 ml-2">(Value: {String(url.indexed)})</span>
                      </div>
                    ) : url.indexed === true ? (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-green-700">Indexed {url.chunk_count ? `(${url.chunk_count} chunks)` : ''}</span>
                        <span className="text-xs text-gray-500 ml-2">(Value: {String(url.indexed)})</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-gray-500">Unknown</span>
                        <span className="text-xs text-gray-500 ml-2">(Value: {String(url.indexed)})</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {url.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {url.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderCredibilityScore(url.credibility_score)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(url.added_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-primary hover:text-primary-dark mr-3"
                      onClick={() => startEditing(url)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => onDelete(url.id)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
