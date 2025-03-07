from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, TypeVar, Generic
import databutton as db
import json
from datetime import datetime
import re
from app.auth import AuthorizedUser

router = APIRouter()

# Define models for analytics data
class QueryMetrics(BaseModel):
    query: str
    timestamp: str
    user_id: str
    confidence_level: Optional[str] = None
    response_length: int
    processing_time_ms: Optional[int] = None
    num_sources: int
    avg_semantic_score: Optional[float] = None
    avg_credibility_score: Optional[float] = None
    avg_recency_score: Optional[float] = None
    source_types: Dict[str, int]  # e.g., {"document": 3, "url": 2}
    hallucination_detected: Optional[bool] = None
    tags: List[str] = []

class AnalyticsResponse(BaseModel):
    data: List[QueryMetrics]
    total_count: int
    page: int
    page_size: int

class QueryStatsResponse(BaseModel):
    total_queries: int
    avg_processing_time: Optional[float] = None
    confidence_distribution: Dict[str, int] = {}
    source_type_distribution: Dict[str, int] = {}
    top_queries: List[Dict[str, Any]] = []
    daily_query_counts: List[Dict[str, Any]] = []

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Remove slashes before sanitizing the key
    key = key.replace("/", "")
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

@router.post("/log-query")
async def log_query(metrics: QueryMetrics, user: AuthorizedUser):
    """Log query metrics for analytics"""
    try:
        # Get existing metrics or initialize new list
        user_metrics_key = sanitize_storage_key(f"user_metrics_{user.sub}")
        
        try:
            existing_metrics = db.storage.json.get(user_metrics_key, default=[])
        except:
            existing_metrics = []
            
        # Add new metrics
        existing_metrics.append(metrics.dict())
        
        # Store updated metrics
        db.storage.json.put(user_metrics_key, existing_metrics)
        
        # Also store in global metrics
        try:
            global_metrics = db.storage.json.get("global_metrics", default=[])
        except:
            global_metrics = []
            
        global_metrics.append(metrics.dict())
        db.storage.json.put("global_metrics", global_metrics)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log query metrics: {str(e)}")

@router.get("/queries", response_model=AnalyticsResponse)
async def get_query_history(user: AuthorizedUser, page: int = 1, page_size: int = 20):
    """Get paginated query history for the current user"""
    try:
        user_metrics_key = sanitize_storage_key(f"user_metrics_{user.sub}")
        
        try:
            metrics = db.storage.json.get(user_metrics_key, default=[])
        except:
            metrics = []
            
        # Sort by timestamp (most recent first)
        metrics.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        # Calculate pagination
        total_count = len(metrics)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_metrics = metrics[start_idx:end_idx]
        
        return {
            "data": paginated_metrics,
            "total_count": total_count,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get query history: {str(e)}")

@router.get("/stats", response_model=QueryStatsResponse)
async def get_query_stats(user: AuthorizedUser, days: int = 30):
    """Get aggregated query statistics for visualization"""
    try:
        user_metrics_key = sanitize_storage_key(f"user_metrics_{user.sub}")
        
        try:
            metrics = db.storage.json.get(user_metrics_key, default=[])
        except:
            metrics = []
            
        # Filter metrics by date if needed
        if days > 0:
            cutoff_date = datetime.now().timestamp() - (days * 86400)
            metrics = [m for m in metrics if datetime.fromisoformat(m.get("timestamp", datetime.now().isoformat())).timestamp() > cutoff_date]
        
        # Calculate statistics
        total_queries = len(metrics)
        
        # Average processing time
        processing_times = [m.get("processing_time_ms") for m in metrics if m.get("processing_time_ms") is not None]
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else None
        
        # Confidence level distribution
        confidence_distribution = {}
        for m in metrics:
            level = m.get("confidence_level")
            if level:
                confidence_distribution[level] = confidence_distribution.get(level, 0) + 1
        
        # Source type distribution
        source_type_distribution = {}
        for m in metrics:
            source_types = m.get("source_types", {})
            for source_type, count in source_types.items():
                source_type_distribution[source_type] = source_type_distribution.get(source_type, 0) + count
        
        # Top queries (by frequency)
        query_counts = {}
        for m in metrics:
            query = m.get("query")
            if query:
                query_counts[query] = query_counts.get(query, 0) + 1
                
        top_queries = []
        for query, count in sorted(query_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            top_queries.append({"query": query, "count": count})
        
        # Daily query counts for line chart
        date_counts = {}
        for m in metrics:
            timestamp = m.get("timestamp")
            if timestamp:
                date = timestamp.split("T")[0]  # Extract date part only
                date_counts[date] = date_counts.get(date, 0) + 1
                
        daily_query_counts = []
        for date, count in sorted(date_counts.items()):
            daily_query_counts.append({"date": date, "count": count})
        
        return {
            "total_queries": total_queries,
            "avg_processing_time": avg_processing_time,
            "confidence_distribution": confidence_distribution,
            "source_type_distribution": source_type_distribution,
            "top_queries": top_queries,
            "daily_query_counts": daily_query_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get query statistics: {str(e)}")
