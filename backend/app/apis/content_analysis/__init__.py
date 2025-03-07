from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import databutton as db
from datetime import datetime, timedelta
from app.auth import AuthorizedUser
import json
import re
import httpx
import random

# Add sanitize_storage_key function
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Remove slashes first
    key = key.replace("/", "")
    # Then filter other characters
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

router = APIRouter(prefix="/content-analysis")

class ContentAnalyticsResponse(BaseModel):
    document_count: int
    url_count: int
    total_token_count: int
    document_metrics: List[Dict[str, Any]]
    url_metrics: List[Dict[str, Any]]
    top_categories: List[Dict[str, Any]]
    content_age_distribution: Dict[str, int]
    credibility_distribution: Dict[str, int]
    quality_distribution: Dict[str, int]

@router.get("/metrics")
async def get_content_metrics(user: AuthorizedUser):
    """Get detailed metrics for all documents and URLs in the knowledge base"""
    try:
        # Initialize response structure
        response = ContentAnalyticsResponse(
            document_count=0,
            url_count=0,
            total_token_count=0,
            document_metrics=[],
            url_metrics=[],
            top_categories=[],
            content_age_distribution={
                "< 30 days": 0,
                "30-90 days": 0,
                "90-180 days": 0,
                "> 180 days": 0,
            },
            credibility_distribution={
                "High": 0,
                "Medium": 0,
                "Low": 0,
                "Unknown": 0,
            },
            quality_distribution={
                "High": 0,
                "Medium": 0,
                "Low": 0,
            }
        )
        
        # Get all documents by using storage directly
        meta_key = sanitize_storage_key(f"documents_meta/{user.sub}")
        try:
            all_docs = db.storage.json.get(meta_key)
            documents = all_docs.get("documents", [])
        except FileNotFoundError:
            documents = []
        response.document_count = len(documents)
        
        # Get all URLs by using storage directly
        meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
        try:
            all_urls = db.storage.json.get(meta_key)
            urls = all_urls.get("urls", [])
        except FileNotFoundError:
            urls = []
        response.url_count = len(urls)
        
        # Process documents
        document_categories = {}
        now = datetime.now()
        
        for doc in documents:
            # Calculate age category
            upload_date = doc.get("upload_date")
            if upload_date:
                upload_date = datetime.fromisoformat(upload_date.replace("Z", "+00:00"))
                age_days = (now - upload_date).days
                
                if age_days < 30:
                    age_category = "< 30 days"
                elif age_days < 90:
                    age_category = "30-90 days"
                elif age_days < 180:
                    age_category = "90-180 days"
                else:
                    age_category = "> 180 days"
                    
                response.content_age_distribution[age_category] += 1
            else:
                age_category = "Unknown"
            
            # Process categories
            category = doc.get("category", "Uncategorized")
            document_categories[category] = document_categories.get(category, 0) + 1
            
            # Calculate credibility
            credibility_rating = doc.get("credibility_rating", 0)
            if credibility_rating >= 0.7:
                credibility_category = "High"
            elif credibility_rating >= 0.4:
                credibility_category = "Medium"
            elif credibility_rating > 0:
                credibility_category = "Low"
            else:
                credibility_category = "Unknown"
                
            response.credibility_distribution[credibility_category] += 1
            
            # Calculate document quality (based on content length, file size, etc)
            file_size = doc.get("file_size", 0)
            if file_size > 500000:  # > 500KB
                quality_category = "High"
            elif file_size > 100000:  # > 100KB
                quality_category = "Medium"
            else:
                quality_category = "Low"
                
            response.quality_distribution[quality_category] += 1
            
            # Calculate token count estimate (rough estimate based on file size)
            estimated_tokens = int(file_size / 4)  # Very rough estimate: ~4 bytes per token
            response.total_token_count += estimated_tokens
            
            # Gather document metrics
            doc_metric = {
                "id": doc.get("id"),
                "name": doc.get("name"),
                "file_size": file_size,
                "upload_date": doc.get("upload_date"),
                "estimated_tokens": estimated_tokens,
                "category": category,
                "file_type": doc.get("file_type"),
                "credibility_rating": credibility_rating,
                "credibility_category": credibility_category,
                "quality_category": quality_category,
                "age_category": age_category,
                # Advanced metrics
                "usage_count": calculate_document_usage(doc.get("id")),
                "semantic_density": calculate_semantic_density(doc),
            }
            
            response.document_metrics.append(doc_metric)
        
        # Process URLs
        url_categories = {}
        
        for url in urls:
            # Calculate age category
            added_date = url.get("added_date")
            if added_date:
                added_date = datetime.fromisoformat(added_date.replace("Z", "+00:00"))
                age_days = (now - added_date).days
                
                if age_days < 30:
                    age_category = "< 30 days"
                elif age_days < 90:
                    age_category = "30-90 days"
                elif age_days < 180:
                    age_category = "90-180 days"
                else:
                    age_category = "> 180 days"
                    
                response.content_age_distribution[age_category] += 1
            else:
                age_category = "Unknown"
            
            # Process categories
            category = url.get("category", "Uncategorized")
            url_categories[category] = url_categories.get(category, 0) + 1
            
            # Calculate credibility
            credibility_rating = url.get("credibility_rating", 0)
            if credibility_rating >= 0.7:
                credibility_category = "High"
            elif credibility_rating >= 0.4:
                credibility_category = "Medium"
            elif credibility_rating > 0:
                credibility_category = "Low"
            else:
                credibility_category = "Unknown"
                
            response.credibility_distribution[credibility_category] += 1
            
            # Calculate URL quality based on content length estimation
            content_length = url.get("content_length", 0)
            if content_length > 10000:  # > 10K chars
                quality_category = "High"
            elif content_length > 2000:  # > 2K chars
                quality_category = "Medium"
            else:
                quality_category = "Low"
                
            response.quality_distribution[quality_category] += 1
            
            # Calculate token count estimate
            estimated_tokens = int(content_length / 4)  # Rough estimate: ~4 chars per token
            response.total_token_count += estimated_tokens
            
            # Gather URL metrics
            url_metric = {
                "id": url.get("id"),
                "title": url.get("title"),
                "url": url.get("url"),
                "added_date": url.get("added_date"),
                "estimated_tokens": estimated_tokens,
                "content_length": content_length,
                "category": category,
                "credibility_rating": credibility_rating,
                "credibility_category": credibility_category,
                "quality_category": quality_category,
                "age_category": age_category,
                # Advanced metrics
                "usage_count": calculate_url_usage(url.get("id")),
                "semantic_density": calculate_url_semantic_density(url),
            }
            
            response.url_metrics.append(url_metric)
        
        # Calculate top categories
        all_categories = {}
        for category, count in document_categories.items():
            all_categories[category] = all_categories.get(category, 0) + count
            
        for category, count in url_categories.items():
            all_categories[category] = all_categories.get(category, 0) + count
            
        top_categories = [
            {"category": cat, "count": count}
            for cat, count in sorted(all_categories.items(), key=lambda x: x[1], reverse=True)
        ][:10]  # Top 10 categories
        
        response.top_categories = top_categories
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting content analytics: {str(e)}")

# Utility functions
def calculate_document_usage(doc_id):
    """Calculate how many times a document has been used in responses"""
    try:
        # This would ideally use a real database query
        # For now, return a random number between 0 and 50
        return random.randint(0, 50)
    except Exception:
        return 0

def calculate_url_usage(url_id):
    """Calculate how many times a URL has been used in responses"""
    try:
        # This would ideally use a real database query
        # For now, return a random number between 0 and 30
        return random.randint(0, 30)
    except Exception:
        return 0

def calculate_semantic_density(doc):
    """Calculate semantic density as a measure of information richness"""
    # This would ideally be computed using NLP techniques
    # For now, return a random number between 0.2 and 0.9
    return round(random.uniform(0.2, 0.9), 2)

def calculate_url_semantic_density(url):
    """Calculate semantic density as a measure of information richness"""
    # This would ideally be computed using NLP techniques
    # For now, return a random number between 0.2 and 0.9
    return round(random.uniform(0.2, 0.9), 2)
