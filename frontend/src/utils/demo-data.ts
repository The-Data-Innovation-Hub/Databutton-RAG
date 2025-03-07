// Sample demo data for analytics visualizations

export const demoQueryStats = {
  total_queries: 124,
  avg_processing_time: 2345,
  confidence_distribution: {
    "HIGH CONFIDENCE": 62,
    "MODERATE CONFIDENCE": 41,
    "LOW CONFIDENCE": 15,
    "INSUFFICIENT DATA": 6
  },
  source_type_distribution: {
    "document": 203,
    "url": 97
  },
  top_queries: [
    { query: "What are the latest guidelines for hypertension management?", count: 8 },
    { query: "How should diabetic ketoacidosis be managed in the emergency setting?", count: 7 },
    { query: "What are the current COVID-19 treatment protocols?", count: 6 },
    { query: "What are the recommended first-line antibiotics for community-acquired pneumonia?", count: 5 },
    { query: "How frequently should HbA1c be monitored in patients with diabetes?", count: 4 }
  ],
  daily_query_counts: generateDailyQueryCounts(30)
};

export const demoQueryHistory = {
  data: generateQueryHistory(20),
  total_count: 124,
  page: 1,
  page_size: 20
};

// Demo data for content analysis
export const demoContentAnalytics = {
  document_count: 124,
  url_count: 57,
  total_token_count: 4872000,
  document_metrics: generateDocumentMetrics(20),
  url_metrics: generateUrlMetrics(10),
  top_categories: [
    { category: "Clinical Guidelines", count: 42 },
    { category: "Infectious Diseases", count: 35 },
    { category: "Medication Reference", count: 28 },
    { category: "Chronic Disease Management", count: 25 },
    { category: "Mental Health", count: 19 },
    { category: "Emergency Medicine", count: 16 },
    { category: "Pediatrics", count: 12 },
    { category: "Obstetrics", count: 11 },
    { category: "Geriatrics", count: 8 },
    { category: "Wound Care", count: 7 },
  ],
  content_age_distribution: {
    "< 30 days": 48,
    "30-90 days": 85,
    "90-180 days": 37,
    "> 180 days": 11,
  },
  credibility_distribution: {
    "High": 112,
    "Medium": 53,
    "Low": 12,
    "Unknown": 4,
  },
  quality_distribution: {
    "High": 87,
    "Medium": 64,
    "Low": 30,
  },
};

// Helper functions to generate demo data
function generateDailyQueryCounts(days: number) {
  const result = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 10) + 1  // Random count between 1-10
    });
  }
  
  return result;
}

// Generate document metrics for content analysis
function generateDocumentMetrics(count: number) {
  const documentNames = [
    "Clinical Practice Guidelines for Hypertension Management",
    "COVID-19 Vaccination Protocols",
    "Antibiotic Resistance Review 2024",
    "Diabetes Care Standards",
    "Mental Health Assessment Framework",
    "Emergency Response Manual",
    "Pediatric Care Handbook",
    "Pregnancy Risk Classification Guide",
    "Geriatric Care Best Practices",
    "Advanced Wound Care Techniques",
  ];
  
  const categories = [
    "Clinical Guidelines",
    "Infectious Diseases",
    "Medication Reference",
    "Chronic Disease Management",
    "Mental Health",
    "Emergency Medicine",
    "Pediatrics",
    "Obstetrics",
    "Geriatrics",
    "Wound Care",
  ];
  
  const fileTypes = ["PDF", "DOCX", "TXT", "HTML", "MD"];
  const qualityCategories = ["High", "Medium", "Low"];
  const ageCategories = ["< 30 days", "30-90 days", "90-180 days", "> 180 days"];
  
  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 180);
    const uploadDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    
    const randomFileSize = Math.floor(Math.random() * 5000000) + 100000;
    const estimatedTokens = Math.floor(randomFileSize / 4); // rough estimate
    
    return {
      id: `doc-${i + 1}`,
      name: documentNames[Math.floor(Math.random() * documentNames.length)],
      file_size: randomFileSize,
      upload_date: uploadDate.toISOString(),
      estimated_tokens: estimatedTokens,
      category: categories[Math.floor(Math.random() * categories.length)],
      file_type: fileTypes[Math.floor(Math.random() * fileTypes.length)],
      credibility_rating: Math.random() * 0.3 + 0.7, // between 0.7 and 1.0
      credibility_category: "High",
      quality_category: qualityCategories[Math.floor(Math.random() * qualityCategories.length)],
      age_category: ageCategories[Math.floor(Math.random() * ageCategories.length)],
      usage_count: Math.floor(Math.random() * 40) + 5,
      semantic_density: Math.random() * 0.3 + 0.6, // between 0.6 and 0.9
    };
  });
}

// Generate URL metrics for content analysis
function generateUrlMetrics(count: number) {
  const urlTitles = [
    "WHO Hypertension Guidelines",
    "CDC COVID-19 Vaccination Information",
    "NIH Antibiotic Resistance Portal",
    "American Diabetes Association Standards",
    "Mental Health Foundation Resources",
    "Emergency Medicine Journal",
    "American Academy of Pediatrics",
    "ACOG Pregnancy Resources",
    "American Geriatrics Society",
    "Wound Care Society Guidelines",
  ];
  
  const urls = [
    "https://www.who.int/health-topics/hypertension",
    "https://www.cdc.gov/coronavirus/2019-ncov/vaccines",
    "https://www.nih.gov/research-training/antibiotic-resistance",
    "https://www.diabetes.org/diabetes/treatment-care",
    "https://www.mentalhealth.org/resources",
    "https://www.acep.org/resources",
    "https://www.aap.org/guidelines",
    "https://www.acog.org/womens-health",
    "https://www.americangeriatrics.org/guidelines",
    "https://woundhealingsociety.org/guidelines",
  ];
  
  const categories = [
    "Clinical Guidelines",
    "Infectious Diseases",
    "Medication Reference",
    "Chronic Disease Management",
    "Mental Health",
    "Emergency Medicine",
    "Pediatrics",
    "Obstetrics",
    "Geriatrics",
    "Wound Care",
  ];
  
  const qualityCategories = ["High", "Medium", "Low"];
  const ageCategories = ["< 30 days", "30-90 days", "90-180 days", "> 180 days"];
  
  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 180);
    const addedDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    
    const contentLength = Math.floor(Math.random() * 30000) + 5000;
    const estimatedTokens = Math.floor(contentLength / 4); // rough estimate
    
    const titleIndex = Math.floor(Math.random() * urlTitles.length);
    
    return {
      id: `url-${i + 1}`,
      title: urlTitles[titleIndex],
      url: urls[titleIndex],
      added_date: addedDate.toISOString(),
      estimated_tokens: estimatedTokens,
      content_length: contentLength,
      category: categories[Math.floor(Math.random() * categories.length)],
      credibility_rating: Math.random() * 0.3 + 0.7, // between 0.7 and 1.0
      credibility_category: "High",
      quality_category: qualityCategories[Math.floor(Math.random() * qualityCategories.length)],
      age_category: ageCategories[Math.floor(Math.random() * ageCategories.length)],
      usage_count: Math.floor(Math.random() * 30) + 2,
      semantic_density: Math.random() * 0.3 + 0.6, // between 0.6 and 0.9
    };
  });
}

function generateQueryHistory(count: number) {
  const queries = [
    "What are the latest guidelines for hypertension management?",
    "How should diabetic ketoacidosis be managed in the emergency setting?",
    "What are the current COVID-19 treatment protocols?",
    "What are the recommended first-line antibiotics for community-acquired pneumonia?",
    "How frequently should HbA1c be monitored in patients with diabetes?",
    "What are the indications for CT scan in minor head injury?",
    "What is the recommended management for acute ischemic stroke?",
    "When should thrombolytic therapy be considered for pulmonary embolism?",
    "What is the current approach to sepsis management?",
    "How should acute exacerbation of COPD be managed?"
  ];
  
  const confidenceLevels = ["HIGH CONFIDENCE", "MODERATE CONFIDENCE", "LOW CONFIDENCE", "INSUFFICIENT DATA"];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const queryIndex = Math.floor(Math.random() * queries.length);
    const confidenceIndex = Math.floor(Math.random() * 100);
    let confidence;
    
    // Weight the confidence levels realistically
    if (confidenceIndex < 50) {
      confidence = confidenceLevels[0]; // 50% high confidence
    } else if (confidenceIndex < 80) {
      confidence = confidenceLevels[1]; // 30% moderate confidence
    } else if (confidenceIndex < 95) {
      confidence = confidenceLevels[2]; // 15% low confidence
    } else {
      confidence = confidenceLevels[3]; // 5% insufficient data
    }
    
    // Create random scores between 0.5 and 1.0
    const semantic_score = 0.5 + (Math.random() * 0.5);
    const credibility_score = 0.5 + (Math.random() * 0.5);
    const recency_score = 0.5 + (Math.random() * 0.5);
    
    // Create timestamp within the last week
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 7));
    timestamp.setHours(Math.floor(Math.random() * 24));
    timestamp.setMinutes(Math.floor(Math.random() * 60));
    
    result.push({
      query: queries[queryIndex],
      timestamp: timestamp.toISOString(),
      user_id: "demo-user",
      confidence_level: confidence,
      response_length: Math.floor(Math.random() * 1000) + 500,
      processing_time_ms: Math.floor(Math.random() * 3000) + 1000,
      num_sources: Math.floor(Math.random() * 5) + 1,
      avg_semantic_score: semantic_score,
      avg_credibility_score: credibility_score,
      avg_recency_score: recency_score,
      source_types: {
        "document": Math.floor(Math.random() * 3) + 1,
        "url": Math.floor(Math.random() * 2)
      },
      hallucination_detected: Math.random() < 0.05, // 5% chance of hallucination
      tags: []
    });
  }
  
  return result;
}
