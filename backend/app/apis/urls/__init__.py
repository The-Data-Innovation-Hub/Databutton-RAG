from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator, HttpUrl
from typing import List, Optional
import uuid
import datetime
import re
from app.auth import AuthorizedUser
import httpx
import databutton as db

router = APIRouter(prefix="/urls")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Remove slashes first
    key = key.replace("/", "")
    # Then filter other characters
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Models
class URLCreateRequest(BaseModel):
    url: HttpUrl
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    credibility_score: Optional[int] = None
    
    @validator('credibility_score')
    def validate_credibility_score(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Credibility score must be between 1 and 5')
        return v

class URLResponse(BaseModel):
    id: str
    url: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    credibility_score: Optional[int] = None
    added_date: str
    user_id: str
    indexed: Optional[bool] = None
    chunk_count: Optional[int] = None
    
    class Config:
        # Ensure dict representation doesn't filter out False values
        json_encoders = {
            bool: lambda v: v
        }
        # Ensure the indexed field is explicitly included in response
        # even when it's False or None
        schema_extra = {
            "example": {
                "indexed": False
            }
        }

class URLsListResponse(BaseModel):
    urls: List[URLResponse]

class UpdateURLRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    credibility_score: Optional[int] = None
    
    @validator('credibility_score')
    def validate_credibility_score(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Credibility score must be between 1 and 5')
        return v

# Endpoints
@router.post("", response_model=URLResponse)
async def add_url(user: AuthorizedUser, data: URLCreateRequest):
    """Add a new validated URL with metadata"""
    # Generate unique ID for the URL
    url_id = str(uuid.uuid4())
    
    # Create URL metadata
    now = datetime.datetime.now().isoformat()
    url_data = {
        "id": url_id,
        "url": str(data.url),
        "title": data.title,
        "description": data.description,
        "category": data.category,
        "credibility_score": data.credibility_score,
        "added_date": now,
        "user_id": user.sub,
        "indexed": False
    }
    
    # Get existing URL metadata or create new list
    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
    try:
        all_urls = db.storage.json.get(meta_key)
    except FileNotFoundError:
        all_urls = {"urls": []}
    
    # Add new URL metadata
    all_urls["urls"].append(url_data)
    db.storage.json.put(meta_key, all_urls)
    
    # Directly index the URL without making HTTP requests
    try:
        # Import the indexing function to call directly
        from app.apis.embeddings import index_url as index_url_func
        
        # Start the background task to index the URL
        async def background_index():
            try:
                # Call the indexing function directly
                result = await index_url_func(url_id=url_id, user=user)
                print(f"URL {url_id} indexed successfully")
            except Exception as e:
                print(f"Error in background indexing for URL {url_id}: {str(e)}")
                # Update URL metadata to show indexing failed
                try:
                    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
                    url_meta = db.storage.json.get(meta_key)
                    for i, url in enumerate(url_meta["urls"]):
                        if url["id"] == url_id:
                            url_meta["urls"][i]["indexed"] = None
                            db.storage.json.put(meta_key, url_meta)
                            break
                except Exception as update_err:
                    print(f"Failed to update URL metadata: {str(update_err)}")
        
        # Start the background task without awaiting it
        import asyncio
        asyncio.create_task(background_index())
    except Exception as e:
        print(f"Failed to trigger URL indexing: {str(e)}")
    
    return URLResponse(**url_data)

@router.get("", response_model=URLsListResponse)
async def list_urls(user: AuthorizedUser, category: Optional[str] = None):
    """List all URLs added by the user"""
    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
    
    try:
        all_urls = db.storage.json.get(meta_key)
        
        # Debug log metadata
        if all_urls and "urls" in all_urls and len(all_urls["urls"]) > 0:
            print(f"[DEBUG] URL list - found {len(all_urls['urls'])} URLs")
            for i, url in enumerate(all_urls["urls"]):
                indexed_value = url.get("indexed", "NOT PRESENT")
                indexed_type = type(indexed_value).__name__ if indexed_value != "NOT PRESENT" else "N/A"
                print(f"[DEBUG] URL {i}: id={url.get('id')}, indexed={indexed_value} (type: {indexed_type})")
    except FileNotFoundError:
        return URLsListResponse(urls=[])
    
    # Filter by category if specified
    if category:
        filtered_urls = [url for url in all_urls["urls"] if url.get("category") == category]
        return URLsListResponse(urls=filtered_urls)
    
    return URLsListResponse(urls=all_urls["urls"])

@router.get("/{url_id}", response_model=URLResponse)
async def get_url(url_id: str, user: AuthorizedUser):
    """Get a specific URL's metadata"""
    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
    
    try:
        all_urls = db.storage.json.get(meta_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Find the URL
    for url in all_urls["urls"]:
        if url["id"] == url_id:
            return URLResponse(**url)
    
    raise HTTPException(status_code=404, detail="URL not found")

@router.put("/{url_id}", response_model=URLResponse)
async def update_url(url_id: str, data: UpdateURLRequest, user: AuthorizedUser):
    """Update a URL's metadata"""
    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
    
    try:
        all_urls = db.storage.json.get(meta_key)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Find and update the URL
    for i, url in enumerate(all_urls["urls"]):
        if url["id"] == url_id:
            # Update fields if provided
            if data.title is not None:
                all_urls["urls"][i]["title"] = data.title
            if data.description is not None:
                all_urls["urls"][i]["description"] = data.description
            if data.category is not None:
                all_urls["urls"][i]["category"] = data.category
            if data.credibility_score is not None:
                all_urls["urls"][i]["credibility_score"] = data.credibility_score
            
            # Save updated metadata
            db.storage.json.put(meta_key, all_urls)
            return URLResponse(**all_urls["urls"][i])
    
    raise HTTPException(status_code=404, detail="URL not found")

@router.delete("/{url_id}", status_code=204)
async def delete_url(url_id: str, user: AuthorizedUser):
    """Delete a URL"""
    print(f"[DEBUG] Attempting to delete URL with ID: {url_id}")
    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
    
    try:
        all_urls = db.storage.json.get(meta_key)
        print(f"[DEBUG] Found URL metadata with {len(all_urls['urls'])} URLs")
    except FileNotFoundError:
        print(f"[DEBUG] URL metadata not found for user {user.sub}")
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Find the URL to delete
    url_found = False
    for i, url in enumerate(all_urls["urls"]):
        if url["id"] == url_id:
            url_found = True
            print(f"[DEBUG] URL found at index {i}, removing it")
            all_urls["urls"].pop(i)
            db.storage.json.put(meta_key, all_urls)
            print(f"[DEBUG] URL successfully deleted. New count: {len(all_urls['urls'])}")
            return None
    
    print(f"[DEBUG] URL with ID {url_id} not found in metadata")
    raise HTTPException(status_code=404, detail="URL not found")

@router.get("/categories/list", response_model=List[str])
async def list_url_categories(user: AuthorizedUser):
    """List all URL categories used by the user"""
    meta_key = sanitize_storage_key(f"urls_meta/{user.sub}")
    
    try:
        all_urls = db.storage.json.get(meta_key)
    except FileNotFoundError:
        return []
    
    # Extract unique categories
    categories = set()
    for url in all_urls["urls"]:
        if url.get("category"):
            categories.add(url["category"])
    
    return list(categories)