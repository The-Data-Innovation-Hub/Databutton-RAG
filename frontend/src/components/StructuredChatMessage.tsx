import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Source } from "utils/chat-types";
import { confidenceLevels } from "utils/chat-types";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, AlertCircle, Info, ExternalLink } from "lucide-react";

interface Props {
  content: string;
  sources?: Source[];
  role: string;
}

// Helper function to extract confidence level from content
const extractConfidenceLevel = (content: string): { level: string | null; content: string } => {
  const confidenceLevelRegex = /^\[([A-Z\s]+)\]\s*/;
  const match = content.match(confidenceLevelRegex);
  
  if (match && match[1]) {
    return {
      level: match[1],
      content: content.replace(confidenceLevelRegex, "")
    };
  }
  
  return { level: null, content };
};

// Function to check if content has a structured format
const hasStructuredFormat = (content: string): boolean => {
  // Check for typical structure patterns like "## Query:" or "## Response:"
  return content.includes("## Query:") || 
         content.includes("## Question:") || 
         content.includes("## Response:") || 
         content.includes("## Sources:");
};

// Component to render plain text message with markdown
const PlainMessageContent = ({ content }: { content: string }) => {
  const { level, content: cleanedContent } = extractConfidenceLevel(content);
  
  return (
    <div className="space-y-2">
      {level && confidenceLevels[level as keyof typeof confidenceLevels] && (
        <div className={`px-3 py-1 rounded-md inline-flex items-center gap-2 text-sm font-medium mb-2 ${confidenceLevels[level as keyof typeof confidenceLevels].color}`}>
          <span>{confidenceLevels[level as keyof typeof confidenceLevels].icon}</span>
          <span>{level}</span>
        </div>
      )}
      <div className="prose prose-sm prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 max-w-none">
        <ReactMarkdown>{cleanedContent}</ReactMarkdown>
      </div>
    </div>
  );
};

// Component to render structured content with enhanced formatting
// Helper to get confidence icon
const getConfidenceIcon = (level: string) => {
  if (level.includes("HIGH")) return <CheckCircle className="h-4 w-4" />;
  if (level.includes("MODERATE")) return <Info className="h-4 w-4" />;
  if (level.includes("LOW")) return <AlertTriangle className="h-4 w-4" />;
  return <AlertCircle className="h-4 w-4" />;
};

// Helper to get RAG rating color and icon
const getRagRatingDisplay = (score: string | undefined) => {
  if (!score) return { color: "bg-gray-100 border-gray-300 text-gray-700", icon: <Info className="h-4 w-4" />, label: "Unknown" };
  
  const scoreNum = parseFloat(score);
  if (scoreNum >= 80) return { 
    color: "bg-green-100 border-green-300 text-green-800", 
    icon: <CheckCircle className="h-4 w-4 text-green-600" />, 
    label: "High Quality" 
  };
  if (scoreNum >= 60) return { 
    color: "bg-blue-100 border-blue-300 text-blue-800", 
    icon: <Info className="h-4 w-4 text-blue-600" />, 
    label: "Good Quality" 
  };
  if (scoreNum >= 40) return { 
    color: "bg-yellow-100 border-yellow-300 text-yellow-800", 
    icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />, 
    label: "Fair Quality" 
  };
  return { 
    color: "bg-red-100 border-red-300 text-red-800", 
    icon: <AlertCircle className="h-4 w-4 text-red-600" />, 
    label: "Low Quality" 
  };
};

const StructuredMessageContent = ({ content }: { content: string }) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({ 
    Response: true, 
    Sources: false, 
    Ranking: false 
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const { level, content: cleanedContent } = extractConfidenceLevel(content);
  
  // Split content into sections
  const sections: {[key: string]: string} = {};
  const sectionTitles = ["## Query:", "## Question:", "## Response:", "## Sources:", "## Ranking:"];
  
  let currentSection = "";
  let currentContent = "";
  
  // Parse the content into sections
  const lines = cleanedContent.split("\n");
  for (const line of lines) {
    const matchedSection = sectionTitles.find(title => line.trim().startsWith(title));
    
    if (matchedSection) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.trim();
      }
      // Start new section
      currentSection = matchedSection.replace("## ", "").replace(":", "");
      currentContent = "";
    } else if (currentSection) {
      currentContent += line + "\n";
    }
  }
  
  // Save the last section
  if (currentSection) {
    sections[currentSection] = currentContent.trim();
  }
  
  // Extract RAG rating if present
  let ragRating = "";
  if (sections.Ranking) {
    const match = sections.Ranking.match(/Overall Quality: (\d+)%/);
    if (match && match[1]) {
      ragRating = match[1];
    }
  }
  
  const ragDisplay = getRagRatingDisplay(ragRating);
  
  return (
    <div className="space-y-4">
      {/* Header with Confidence Level and RAG Rating */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Confidence indicator */}
        {level && confidenceLevels[level as keyof typeof confidenceLevels] && (
          <div className={`px-3 py-1 rounded-md inline-flex items-center gap-2 text-sm font-medium ${confidenceLevels[level as keyof typeof confidenceLevels].color}`}>
            {getConfidenceIcon(level)}
            <span>{level}</span>
          </div>
        )}
        
        {/* RAG quality indicator */}
        {ragRating && (
          <div className={`px-3 py-1 rounded-md inline-flex items-center gap-2 text-sm font-medium ${ragDisplay.color}`}>
            {ragDisplay.icon}
            <span>RAG Quality: {ragRating}% - {ragDisplay.label}</span>
          </div>
        )}
      </div>
      
      {/* Description of confidence */}
      {level && confidenceLevels[level as keyof typeof confidenceLevels] && (
        <div className="text-xs text-gray-500 italic mb-4">
          {confidenceLevels[level as keyof typeof confidenceLevels].description}
        </div>
      )}
      
      {/* Main content card */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Query/Question Section - Always visible */}
        {(sections.Query || sections.Question) && (
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-1 flex items-center">
              <span className="mr-1">🔍</span>
              {sections.Query ? "Query" : "Question"}:
            </h3>
            <div className="text-gray-700 font-medium">
              {sections.Query || sections.Question}
            </div>
          </div>
        )}
        
        {/* Response Section - Collapsible */}
        {sections.Response && (
          <div className="border-b border-gray-200 last:border-b-0">
            <div 
              className="bg-white p-3 cursor-pointer flex justify-between items-center hover:bg-gray-50"
              onClick={() => toggleSection("Response")}
            >
              <h3 className="text-sm font-semibold text-gray-600 flex items-center">
                <span className="mr-1">💬</span>
                Response
              </h3>
              <div>
                {expandedSections.Response ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
            
            {expandedSections.Response && (
              <div className="bg-white p-3 pt-0 border-t border-gray-100">
                <div className="prose prose-sm prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 max-w-none pl-6">
                  <ReactMarkdown>{sections.Response}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sources Section removed to prevent duplication - only showing in the dedicated sources section below */}
        
        {/* Ranking Section - Collapsible */}
        {sections.Ranking && (
          <div className="last:border-b-0">
            <div 
              className={`p-3 cursor-pointer flex justify-between items-center ${ragDisplay.color} hover:bg-opacity-80`}
              onClick={() => toggleSection("Ranking")}
            >
              <h3 className="text-sm font-semibold flex items-center">
                {ragDisplay.icon}
                <span className="ml-1">RAG Quality Assessment</span>
              </h3>
              <div className="flex items-center">
                <span className="text-xs mr-2">{expandedSections.Ranking ? "Hide details" : "Show details"}</span>
                {expandedSections.Ranking ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            
            {expandedSections.Ranking && (
              <div className="bg-white p-3 pt-2 border-t border-gray-100">
                <div className="prose prose-sm max-w-none pl-6">
                  <ReactMarkdown>{sections.Ranking}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const StructuredChatMessage: React.FC<Props> = ({ content, sources, role }) => {
  // Initialize sources section as collapsed by default
  const [expandedSources, setExpandedSources] = useState<boolean>(false);
  
  // Determine if this is a user message or an AI response
  if (role === "user") {
    return (
      <div className="bg-blue-500 text-white rounded-lg px-4 py-3">
        <div className="prose prose-sm prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 max-w-none prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }
  
  // For AI messages, determine if it's structured or plain
  const isStructured = hasStructuredFormat(content);
  
  // Parse content into sections if structured
  const sections: {[key: string]: string} = {};
  if (isStructured) {
    const sectionTitles = ["## Query:", "## Question:", "## Response:", "## Sources:", "## Ranking:"];
    
    let currentSection = "";
    let currentContent = "";
    
    // Parse the content into sections
    const lines = content.split("\n");
    for (const line of lines) {
      const matchedSection = sectionTitles.find(title => line.trim().startsWith(title));
      
      if (matchedSection) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = currentContent.trim();
        }
        // Start new section
        currentSection = matchedSection.replace("## ", "").replace(":", "");
        currentContent = "";
      } else if (currentSection) {
        currentContent += line + "\n";
      }
    }
    
    // Save the last section
    if (currentSection) {
      sections[currentSection] = currentContent.trim();
    }
  }
  
  // Track expanded state for source details and excerpts by index
  const [expandedDetails, setExpandedDetails] = useState<{[key: number]: boolean}>({});
  const [expandedExcerpts, setExpandedExcerpts] = useState<{[key: number]: boolean}>({});
  
  // Toggle expanded state for a specific source
  const toggleSourceDetails = (idx: number) => {
    setExpandedDetails(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };
  
  // Toggle expanded state for a specific excerpt
  const toggleExcerpt = (idx: number) => {
    setExpandedExcerpts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };
  
  // Get confidence level for styling
  const { level } = extractConfidenceLevel(content);
  let messageClass = "bg-gray-100 text-gray-800";
  
  // Set background color based on confidence level
  if (level) {
    if (level.includes("HIGH")) {
      messageClass = "bg-green-50 text-gray-800 border-green-200";
    } else if (level.includes("MODERATE")) {
      messageClass = "bg-blue-50 text-gray-800 border-blue-200";
    } else if (level.includes("LOW")) {
      messageClass = "bg-yellow-50 text-gray-800 border-yellow-200";
    } else if (level.includes("INSUFFICIENT")) {
      messageClass = "bg-gray-50 text-gray-800 border-gray-200";
    }
  }
  
  return (
    <div className={`rounded-lg px-4 py-3 border shadow-sm ${messageClass}`}>
      {isStructured ? 
        <StructuredMessageContent content={content} /> : 
        <PlainMessageContent content={content} />
      }
      
      {/* Sources (if provided separately) - Only show if not already in structured content */}
      {sources && sources.length > 0 && !(isStructured && sections.Sources) && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div 
            className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded-md"
            onClick={() => setExpandedSources(!expandedSources)}
          >
            <div className="font-medium text-gray-700 flex items-center">
              <span className="mr-1">📚</span>
              Sources Used ({sources.length})
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">{expandedSources ? "Hide sources" : "Show sources"}</span>
              {expandedSources ? 
                <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                <ChevronDown className="h-4 w-4 text-gray-500" />}
            </div>
          </div>
          
          {expandedSources && (
            <div className="space-y-2 mt-2 pl-2 border-l-2 border-gray-200">
              {sources.map((source, idx) => {
                // Determine source quality color based on composite score
                const getScoreColor = (score?: number) => {
                  if (!score) return "bg-gray-100 border-gray-300";
                  if (score >= 0.8) return "bg-green-100 border-green-300";
                  if (score >= 0.6) return "bg-blue-100 border-blue-300";
                  if (score >= 0.4) return "bg-yellow-100 border-yellow-300";
                  return "bg-red-100 border-red-300";
                };
                
                const compositeScore = source.ranking_info?.composite_score;
                const scoreColor = getScoreColor(compositeScore);
                
                return (
                  <div 
                    key={idx} 
                    className={`text-xs rounded-md p-2 border ${scoreColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium flex items-center">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {source.document_name}
                      </div>
                      {source.ranking_info && (
                        <button 
                          onClick={() => toggleSourceDetails(idx)}
                          className="text-gray-600 hover:text-gray-800 ml-2 text-xs flex items-center"
                        >
                          {expandedDetails[idx] ? 
                            <><ChevronUp className="h-3 w-3 mr-1" /> Hide details</> : 
                            <><ChevronDown className="h-3 w-3 mr-1" /> Details</>}
                        </button>
                      )}
                    </div>
                    
                    {/* Source metadata */}
                    <div className="flex text-gray-500 mt-1 space-x-4">
                      {source.credibility_score && (
                        <div>
                          <span className="font-medium">Quality:</span> {source.credibility_score}/5
                        </div>
                      )}
                      {source.publication_date && (
                        <div>
                          <span className="font-medium">Date:</span> {new Date(source.publication_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Excerpt toggle button */}
                    {source.excerpt && (
                      <div className="mt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExcerpt(idx);
                          }}
                          className="text-gray-600 hover:text-gray-800 text-xs flex items-center"
                        >
                          {expandedExcerpts[idx] ? 
                            <><ChevronUp className="h-3 w-3 mr-1" /> Hide excerpt</> : 
                            <><ChevronDown className="h-3 w-3 mr-1" /> Show excerpt</>}
                        </button>
                        
                        {/* Excerpt content (expandable) */}
                        {expandedExcerpts[idx] && (
                          <div className="text-gray-600 mt-1 border-l-2 border-gray-300 pl-2 italic">
                            {source.excerpt}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Ranking details (collapsible) */}
                    {expandedDetails[idx] && source.ranking_info && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-gray-500 grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Match:</span> {Math.round(source.ranking_info.semantic_score! * 100)}%
                        </div>
                        <div>
                          <span className="font-medium">Recency:</span> {source.ranking_info.recency_score ? Math.round(source.ranking_info.recency_score * 100) + '%' : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Quality:</span> {source.ranking_info.credibility_score ? Math.round(source.ranking_info.credibility_score * 100) + '%' : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Overall:</span> {Math.round(source.ranking_info.composite_score * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
