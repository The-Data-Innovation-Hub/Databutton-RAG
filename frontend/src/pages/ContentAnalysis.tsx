import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthPageWrapper } from "../components/AuthPageWrapper";
import { ToasterProvider } from "../components/ToasterProvider";
import { Button } from "../components/Button";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Chip,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Collapse,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArticleIcon from "@mui/icons-material/Article";
import LinkIcon from "@mui/icons-material/Link";
import brain from "brain";

// Types for content analysis
interface ContentMetric {
  id: string;
  name?: string;
  title?: string;
  url?: string;
  file_size?: number;
  content_length?: number;
  upload_date?: string;
  added_date?: string;
  estimated_tokens: number;
  category: string;
  file_type?: string;
  credibility_rating: number;
  credibility_category: string;
  quality_category: string;
  age_category: string;
  usage_count: number;
  semantic_density: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface ContentAnalysisData {
  document_count: number;
  url_count: number;
  total_token_count: number;
  document_metrics: ContentMetric[];
  url_metrics: ContentMetric[];
  top_categories: CategoryCount[];
  content_age_distribution: Record<string, number>;
  credibility_distribution: Record<string, number>;
  quality_distribution: Record<string, number>;
}

// Main component
export default function ContentAnalysis() {
  return (
    <AuthPageWrapper>
      <ToasterProvider />
      <ContentAnalysisContent />
    </AuthPageWrapper>
  );
}

function ContentAnalysisContent() {
  const [contentData, setContentData] = useState<ContentAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [detailView, setDetailView] = useState<string | null>(null);
  
  // Sorting states
  const [documentSortField, setDocumentSortField] = useState<keyof ContentMetric>("credibility_rating");
  const [documentSortDirection, setDocumentSortDirection] = useState<"asc" | "desc">("desc");
  const [urlSortField, setUrlSortField] = useState<keyof ContentMetric>("credibility_rating");
  const [urlSortDirection, setUrlSortDirection] = useState<"asc" | "desc">("desc");
  
  // Filtering states
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");
  const [credibilityFilter, setCredibilityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Fetch content analytics data
  useEffect(() => {
    async function fetchContentAnalytics() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await brain.get_content_metrics({});
        const data = await response.json();
        
        console.log("Content analysis data:", data);
        setContentData(data);
      } catch (error) {
        console.error("Error fetching content analytics:", error);
        setError("Failed to load content analytics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContentAnalytics();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Toggle detail view
  const toggleDetailView = (id: string) => {
    if (detailView === id) {
      setDetailView(null);
    } else {
      setDetailView(id);
    }
  };
  
  // Handle document sort
  const handleDocumentSort = (field: keyof ContentMetric) => {
    if (field === documentSortField) {
      setDocumentSortDirection(documentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setDocumentSortField(field);
      setDocumentSortDirection("desc");
    }
  };
  
  // Handle URL sort
  const handleUrlSort = (field: keyof ContentMetric) => {
    if (field === urlSortField) {
      setUrlSortDirection(urlSortDirection === "asc" ? "desc" : "asc");
    } else {
      setUrlSortField(field);
      setUrlSortDirection("desc");
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setCategoryFilter("all");
    setQualityFilter("all");
    setCredibilityFilter("all");
    setSearchQuery("");
  };
  
  // Filter content data
  const filterContent = (items: ContentMetric[]) => {
    return items.filter(item => {
      // Apply category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      
      // Apply quality filter
      if (qualityFilter !== "all" && item.quality_category !== qualityFilter) {
        return false;
      }
      
      // Apply credibility filter
      if (credibilityFilter !== "all" && item.credibility_category !== credibilityFilter) {
        return false;
      }
      
      // Apply search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(searchLower);
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const urlMatch = item.url?.toLowerCase().includes(searchLower);
        const categoryMatch = item.category.toLowerCase().includes(searchLower);
        
        return nameMatch || titleMatch || urlMatch || categoryMatch;
      }
      
      return true;
    });
  };
  
  // Sort content data
  const sortDocuments = (documents: ContentMetric[]) => {
    return [...documents].sort((a, b) => {
      const aValue = a[documentSortField];
      const bValue = b[documentSortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return documentSortDirection === "asc" ? compareResult : -compareResult;
    });
  };
  
  const sortUrls = (urls: ContentMetric[]) => {
    return [...urls].sort((a, b) => {
      const aValue = a[urlSortField];
      const bValue = b[urlSortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return urlSortDirection === "asc" ? compareResult : -compareResult;
    });
  };
  
  // Prepare chart data
  const prepareChartData = (distribution: Record<string, number>) => {
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };
  
  // Prepare bar chart data for categories
  const prepareCategoryChartData = (categories: CategoryCount[]) => {
    return categories.slice(0, 10);
  };
  
  // Get all unique categories for filter
  const getAllCategories = () => {
    if (!contentData) return [];
    
    const docCategories = contentData.document_metrics.map(doc => doc.category);
    const urlCategories = contentData.url_metrics.map(url => url.category);
    const allCategories = [...new Set([...docCategories, ...urlCategories])];
    
    return allCategories.sort();
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1, bgcolor: "background.paper" }}>
          <Typography variant="body2">{`${label}: ${payload[0].value}`}</Typography>
        </Paper>
      );
    }
    return null;
  };
  
  // Get color for credibility
  const getCredibilityColor = (category: string) => {
    switch (category) {
      case "High": return "#0F9D58";
      case "Medium": return "#F4B400";
      case "Low": return "#DB4437";
      default: return "#757575";
    }
  };
  
  // Get color for quality
  const getQualityColor = (category: string) => {
    switch (category) {
      case "High": return "#4285F4";
      case "Medium": return "#A142F4";
      case "Low": return "#F442D5";
      default: return "#757575";
    }
  };
  
  // Get color for age category
  const getAgeColor = (category: string) => {
    switch (category) {
      case "< 30 days": return "#0F9D58";
      case "30-90 days": return "#F4B400";
      case "90-180 days": return "#DB4437";
      case "> 180 days": return "#757575";
      default: return "#CCCCCC";
    }
  };
  
  // Utility function to format file size
  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "N/A";
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Utility function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  // No data state
  if (!contentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No content analysis data available.</Alert>
      </Box>
    );
  }
  
  // Apply filters to data
  const filteredDocuments = filterContent(contentData.document_metrics);
  const filteredUrls = filterContent(contentData.url_metrics);
  
  // Sort data
  const sortedDocuments = sortDocuments(filteredDocuments);
  const sortedUrls = sortUrls(filteredUrls);
  
  // Prepare chart data
  const credibilityChartData = prepareChartData(contentData.credibility_distribution);
  const qualityChartData = prepareChartData(contentData.quality_distribution);
  const ageChartData = prepareChartData(contentData.content_age_distribution);
  const categoryChartData = prepareCategoryChartData(contentData.top_categories);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Content Analysis</h1>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
        
        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ArticleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Documents</Typography>
              </Box>
              <Typography variant="h3" color="text.primary">
                {contentData.document_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total documents in repository
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LinkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">URLs</Typography>
              </Box>
              <Typography variant="h3" color="text.primary">
                {contentData.url_count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total URLs in repository
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Categories</Typography>
              </Box>
              <Typography variant="h3" color="text.primary">
                {contentData.top_categories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique categories
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Token Count</Typography>
              </Box>
              <Typography variant="h3" color="text.primary">
                {(contentData.total_token_count / 1000).toFixed(1)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estimated tokens
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Top Categories</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={categoryChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#4285F4" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Content Age Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAgeColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Credibility Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={credibilityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {credibilityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCredibilityColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quality Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getQualityColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Content Tables */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={`Documents (${filteredDocuments.length})`} />
            <Tab label={`URLs (${filteredUrls.length})`} />
          </Tabs>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {getAllCategories().map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Quality</InputLabel>
                <Select
                  value={qualityFilter}
                  label="Quality"
                  onChange={(e) => setQualityFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Credibility</InputLabel>
                <Select
                  value={credibilityFilter}
                  label="Credibility"
                  onChange={(e) => setCredibilityFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
          
          {/* Documents Tab */}
          {activeTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={documentSortField === "file_size"}
                        direction={documentSortDirection}
                        onClick={() => handleDocumentSort("file_size")}
                      >
                        Size
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={documentSortField === "credibility_rating"}
                        direction={documentSortDirection}
                        onClick={() => handleDocumentSort("credibility_rating")}
                      >
                        Credibility
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={documentSortField === "semantic_density"}
                        direction={documentSortDirection}
                        onClick={() => handleDocumentSort("semantic_density")}
                      >
                        Semantic Density
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={documentSortField === "usage_count"}
                        direction={documentSortDirection}
                        onClick={() => handleDocumentSort("usage_count")}
                      >
                        Usage Count
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedDocuments.map((doc) => (
                    <React.Fragment key={doc.id}>
                      <TableRow hover>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                        <TableCell>
                          <Chip
                            label={doc.credibility_category}
                            sx={{
                              bgcolor: `${getCredibilityColor(doc.credibility_category)}20`,
                              color: getCredibilityColor(doc.credibility_category),
                              fontWeight: 500,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{(doc.semantic_density * 100).toFixed(0)}%</TableCell>
                        <TableCell>{doc.usage_count}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleDetailView(doc.id)}
                            aria-expanded={detailView === doc.id}
                            aria-label="show details"
                          >
                            {detailView === doc.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} style={{ paddingTop: 0, paddingBottom: 0 }}>
                          <Collapse in={detailView === doc.id} timeout="auto" unmountOnExit>
                            <Box sx={{ my: 2, px: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>Document Details</Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body2">
                                      <strong>ID:</strong> {doc.id}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>File Type:</strong> {doc.file_type}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Category:</strong> {doc.category}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Upload Date:</strong> {formatDate(doc.upload_date)}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body2">
                                      <strong>Estimated Tokens:</strong> {doc.estimated_tokens.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Age Category:</strong> {doc.age_category}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Quality Category:</strong> {doc.quality_category}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Credibility Rating:</strong> {(doc.credibility_rating * 100).toFixed(0)}%
                                    </Typography>
                                  </Paper>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* URLs Tab */}
          {activeTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={urlSortField === "credibility_rating"}
                        direction={urlSortDirection}
                        onClick={() => handleUrlSort("credibility_rating")}
                      >
                        Credibility
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={urlSortField === "semantic_density"}
                        direction={urlSortDirection}
                        onClick={() => handleUrlSort("semantic_density")}
                      >
                        Semantic Density
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={urlSortField === "usage_count"}
                        direction={urlSortDirection}
                        onClick={() => handleUrlSort("usage_count")}
                      >
                        Usage Count
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUrls.map((url) => (
                    <React.Fragment key={url.id}>
                      <TableRow hover>
                        <TableCell>{url.title}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                            {url.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={url.credibility_category}
                            sx={{
                              bgcolor: `${getCredibilityColor(url.credibility_category)}20`,
                              color: getCredibilityColor(url.credibility_category),
                              fontWeight: 500,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{(url.semantic_density * 100).toFixed(0)}%</TableCell>
                        <TableCell>{url.usage_count}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleDetailView(url.id)}
                            aria-expanded={detailView === url.id}
                            aria-label="show details"
                          >
                            {detailView === url.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} style={{ paddingTop: 0, paddingBottom: 0 }}>
                          <Collapse in={detailView === url.id} timeout="auto" unmountOnExit>
                            <Box sx={{ my: 2, px: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>URL Details</Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body2">
                                      <strong>ID:</strong> {url.id}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Category:</strong> {url.category}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Added Date:</strong> {formatDate(url.added_date)}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body2">
                                      <strong>Content Length:</strong> {url.content_length?.toLocaleString() || "N/A"} chars
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Estimated Tokens:</strong> {url.estimated_tokens.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Age Category:</strong> {url.age_category}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Quality Category:</strong> {url.quality_category}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Credibility Rating:</strong> {(url.credibility_rating * 100).toFixed(0)}%
                                    </Typography>
                                  </Paper>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </div>
    </div>
  );
}
