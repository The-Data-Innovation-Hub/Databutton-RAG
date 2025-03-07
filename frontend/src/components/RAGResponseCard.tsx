import React, { useState } from "react";
import { Card, CardContent, Typography, Chip, Button, Collapse, Box, Divider, Grid, Paper } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArticleIcon from "@mui/icons-material/Article";
import LinkIcon from "@mui/icons-material/Link";
import { Source } from "utils/chat-types";

// Function to determine color coding and icon
const getRAGStyle = (confidence?: string) => {
  if (!confidence) return { 
    color: "#757575", 
    label: "Unknown",
    icon: <HelpOutlineIcon fontSize="small" />
  };
  
  if (confidence.includes("HIGH")) {
    return { 
      color: "#0F9D58", 
      label: "High Confidence",
      icon: <CircleIcon fontSize="small" />
    };
  } else if (confidence.includes("MODERATE")) {
    return { 
      color: "#F4B400", 
      label: "Moderate Confidence",
      icon: <WarningAmberIcon fontSize="small" />
    };
  } else if (confidence.includes("LOW")) {
    return { 
      color: "#DB4437", 
      label: "Low Confidence",
      icon: <CancelIcon fontSize="small" />
    };
  } else {
    return { 
      color: "#757575", 
      label: "Insufficient Data",
      icon: <HelpOutlineIcon fontSize="small" />
    };
  }
};

// Function to format a score as a percentage
const formatScore = (score?: number): string => {
  if (score === undefined || score === null) return "N/A";
  return `${Math.round(score * 100)}%`;
};

// Function to extract confidence level from content
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

// Function removed since sources are now handled separately

// Function to extract query and response from structured format
const extractStructuredContent = (content: string) => {
  // Default values
  let query = "";
  let response = content;
  let explanation = "";
  
  // Try to extract query
  const queryMatch = content.match(/## Query:\s*([^\n]+)/);
  if (queryMatch && queryMatch[1]) {
    query = queryMatch[1].trim();
  }
  
  // Try to extract response
  const responseMatch = content.match(/## Response:\s*([\s\S]*?)(?=## Ranking:|$)/);
  if (responseMatch && responseMatch[1]) {
    response = responseMatch[1].trim();
  }
  
  // Try to extract explanation/ranking
  const rankingMatch = content.match(/## Ranking:\s*([\s\S]*?)(?=$)/);
  if (rankingMatch && rankingMatch[1]) {
    explanation = rankingMatch[1].trim();
  }
  
  return { query, response, explanation };
};

interface RAGResponseCardProps {
  content: string;
  sources?: Source[];
  role?: string;
}

const RAGResponseCard: React.FC<RAGResponseCardProps> = ({ content, sources = [], role = "assistant" }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract confidence level
  const { level, content: cleanedContent } = extractConfidenceLevel(content);
  
  // Extract structured content
  const { query, response, explanation } = extractStructuredContent(cleanedContent);
  
  const ragStyle = getRAGStyle(level || undefined);

  // Define card styles based on role
  const getUserCardStyle = () => ({
    margin: "12px 0",
    padding: "16px",
    backgroundColor: "#E8F0FE", // Light blue for user messages
    borderRadius: "12px 12px 2px 12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  });

  const getAssistantCardStyle = () => ({
    margin: "12px 0", 
    padding: "16px", 
    backgroundColor: "#FFFFFF", // White for assistant messages
    borderLeft: `6px solid ${ragStyle.color}`,
    borderRadius: "12px 12px 12px 2px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  });

  return (
    <Card sx={role === "user" ? getUserCardStyle() : getAssistantCardStyle()}>
      {/* Query */}
      {query && (
        <Typography variant="h6" fontWeight="bold">
          {query}
        </Typography>
      )}

      {/* Response */}
      <Typography variant="body1" sx={{ marginTop: "8px", whiteSpace: "pre-line" }}>
        {response}
      </Typography>

      {/* RAG Confidence Indicator - only show for assistant messages */}
      {level && role === "assistant" && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '6px' }}>
          <Chip
            icon={<Box component="span" sx={{ color: 'white !important', display: 'flex', alignItems: 'center' }}>{ragStyle.icon}</Box>}
            label={ragStyle.label}
            sx={{
              backgroundColor: ragStyle.color,
              color: "white",
              fontWeight: "bold",
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        </Box>
      )}

      {/* Only show sources button and section for assistant messages with sources */}
      {role === "assistant" && sources && sources.length > 0 && (
        <>
          {/* Toggle Button for Details */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ marginTop: "12px" }}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Sources" : "Show Sources"}
          </Button>

          {/* Collapsible Details Section */}
          <Collapse in={showDetails}>
            <CardContent sx={{ backgroundColor: "#f9f9f9", borderRadius: "6px", marginTop: "10px" }}>
              {/* Sources with ranking information */}
              <Typography variant="subtitle1" fontWeight="bold">
                Sources ({sources.length}):
              </Typography>
              
              {sources.map((source, index) => {
                // Calculate source quality color
                let qualityColor = "#0F9D58"; // Default green
                const score = source.score || 0;
                if (score < 0.5) qualityColor = "#DB4437"; // Red
                else if (score < 0.7) qualityColor = "#F4B400"; // Yellow
                else if (score < 0.85) qualityColor = "#4285F4"; // Blue
                
                // Determine icon based on source type
                const SourceIcon = source.source_type === "document" ? ArticleIcon : LinkIcon;
                
                return (
                  <Paper key={index} sx={{ p: 2, my: 1, borderLeft: `4px solid ${qualityColor}` }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <SourceIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {source.document_name || source.url_title || "Source " + (index + 1)}
                          </Typography>
                        </Box>
                        
                        {/* Excerpt from source */}
                        <Typography variant="body2" sx={{ mt: 1, mb: 1, pl: 1, borderLeft: "2px solid #e0e0e0" }}>
                          {source.excerpt || "No excerpt available"}
                        </Typography>
                        
                        {/* Detailed ranking metrics in a grid */}
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Relevance Metrics:
                          </Typography>
                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Overall Score
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatScore(source.score)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Semantic Match
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatScore(source.semantic_score)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Credibility
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatScore(source.credibility_score)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Recency
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatScore(source.recency_score)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                        
                        {/* Source metadata */}
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                          {source.source_type === "document" ? (
                            <>Document • {source.metadata?.upload_date?.split("T")[0] || "Unknown date"}</>
                          ) : (
                            <>Website • {source.metadata?.added_date?.split("T")[0] || "Unknown date"}</>
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </CardContent>
          </Collapse>
        </>
      )}
    </Card>
  );
};

export default RAGResponseCard;