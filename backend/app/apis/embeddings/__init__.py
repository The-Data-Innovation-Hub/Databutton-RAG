from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import datetime
import databutton as db
import re
import uuid
import json
import pdfplumber
import io
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
import numpy as np
from app.auth import AuthorizedUser

# Import document and URL APIs directly
from app.apis.documents import get_document, get_document_content
from app.apis.urls import get_url

router = APIRouter(prefix="/embeddings")

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    # Remove slashes first
    key = key.replace("/", "")
    # Then filter other characters
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Models
class DocumentChunk(BaseModel):
    document_id: str
    chunk_id: str
    text: str
    metadata: Dict[str, Any]

class URLChunk(BaseModel):
    url_id: str
    chunk_id: str
    text: str
    metadata: Dict[str, Any]

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    document_ids: Optional[List[str]] = None
    url_ids: Optional[List[str]] = None
    categories: Optional[List[str]] = None

class SearchResult(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any]
    score: float  # Final composite score
    source_type: str  # 'document' or 'url'
    semantic_score: float  # Original semantic similarity score
    recency_score: Optional[float] = None  # Score based on how recent the content is
    credibility_score: Optional[float] = None  # Score based on credibility (1-5)
    category_score: Optional[float] = None  # Score based on category relevance

class SearchResponse(BaseModel):
    results: List[SearchResult]

# Helper functions
async def extract_text_from_document(user: AuthorizedUser, document_id: str) -> str:
    """Extract text from a document based on its content type"""
    try:
        # Get document metadata
        doc_response = await get_document(document_id=document_id, user=user)
        
        # Get document content
        content_response = await get_document_content(document_id=document_id, user=user)
        content = content_response.body
        
        # Extract text based on content type
        if doc_response.filename.lower().endswith('.pdf'):
            # Extract text from PDF
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    text = ""
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n\n"
                    
                    if not text.strip():
                        return f"Could not extract text from PDF {doc_response.filename}"
                    return text
            except Exception as e:
                print(f"Error extracting text from PDF {doc_response.filename}: {str(e)}")
                return f"Error extracting text from PDF: {str(e)}"
        
        # For text-based files, decode as UTF-8
        elif any(doc_response.filename.lower().endswith(ext) for ext in [".txt", ".md", ".doc", ".docx"]):
            try:
                return content.decode('utf-8')
            except UnicodeDecodeError:
                return f"Error: Unable to decode {doc_response.filename} as text"
        
        # Unsupported file type
        else:
            return f"Unsupported file type: {doc_response.filename}"
            
    except Exception as e:
        print(f"Error extracting text from document {document_id}: {str(e)}")
        return f"Error extracting text: {str(e)}"

async def scrape_url_content(user: AuthorizedUser, url_id: str) -> str:
    """Scrape content from a URL"""
    try:
        # Get URL metadata
        url_response = await get_url(url_id=url_id, user=user)
        
        # Scrape the URL
        try:
            response = requests.get(url_response.url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML content
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style tags
            for script_or_style in soup(["script", "style"]):
                script_or_style.decompose()
            
            # Get text content
            text = soup.get_text(separator='\n')
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text
        except Exception as e:
            print(f"Error scraping URL {url_response.url}: {str(e)}")
            return f"Error scraping URL: {str(e)}"
            
    except Exception as e:
        print(f"Error processing URL {url_id}: {str(e)}")
        return f"Error processing URL: {str(e)}"

async def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    
    return text_splitter.split_text(text)

async def generate_embeddings(chunks: List[str]) -> List[List[float]]:
    """Generate embeddings for text chunks using OpenAI"""
    try:
        # Get API key from secrets
        api_key = db.secrets.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not configured")
        
        # Initialize OpenAI embeddings
        embeddings = OpenAIEmbeddings(openai_api_key=api_key)
        
        # Generate embeddings
        return embeddings.embed_documents(chunks)
    except Exception as e:
        print(f"Error generating embeddings: {str(e)}")
        raise e

async def store_document_embeddings(user_id: str, document_id: str, chunks: List[str], embeddings: List[List[float]], metadata: Dict[str, Any]):
    """Store document chunks and embeddings"""
    try:
        # Prepare chunks with embeddings
        chunk_data = []
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = f"{document_id}_chunk_{i}"
            
            chunk_data.append({
                "chunk_id": chunk_id,
                "document_id": document_id,
                "text": chunk,
                "embedding": embedding,  # This is a list of floats
                "metadata": metadata
            })
        
        # Store chunks
        chunks_key = sanitize_storage_key(f"embeddings/documents/{user_id}/{document_id}")
        db.storage.json.put(chunks_key, {"chunks": chunk_data})
        
        # Update document metadata to mark as indexed
        doc_meta_key = sanitize_storage_key(f"documents_meta/{user_id}")
        
        try:
            all_docs = db.storage.json.get(doc_meta_key)
            print(f"[DEBUG] Updating document {document_id} indexed status")
            print(f"[DEBUG] Pre-update document metadata: {all_docs['documents'][0].keys()}")
            
            # Mark document as indexed
            document_found = False
            for i, doc in enumerate(all_docs["documents"]):
                if doc["id"] == document_id:
                    document_found = True
                    print(f"[DEBUG] Found document {document_id} at index {i}")
                    print(f"[DEBUG] Current indexed value: {doc.get('indexed', 'NOT PRESENT')}")
                    print(f"[DEBUG] Setting indexed=True and chunk_count={len(chunks)}")
                    
                    # Explicit boolean assignment
                    all_docs["documents"][i]["indexed"] = True
                    all_docs["documents"][i]["chunk_count"] = len(chunks)
                    break
            
            if not document_found:
                print(f"[DEBUG] Document {document_id} not found in metadata!")
            
            # Store the updated metadata
            db.storage.json.put(doc_meta_key, all_docs)
            print(f"[DEBUG] Updated metadata saved successfully")
            
            # Verify the update
            try:
                verification = db.storage.json.get(doc_meta_key)
                for doc in verification["documents"]:
                    if doc["id"] == document_id:
                        print(f"[DEBUG] Verification - indexed value is now: {doc.get('indexed', 'NOT PRESENT')}")
                        print(f"[DEBUG] Verification - indexed type: {type(doc.get('indexed')).__name__}")
                        break
            except Exception as ve:
                print(f"[DEBUG] Verification failed: {str(ve)}")
        except Exception as e:
            print(f"Error updating document metadata: {str(e)}")
        
        return True
    except Exception as e:
        print(f"Error storing document embeddings: {str(e)}")
        return False

async def store_url_embeddings(user_id: str, url_id: str, chunks: List[str], embeddings: List[List[float]], metadata: Dict[str, Any]):
    """Store URL chunks and embeddings"""
    try:
        # Prepare chunks with embeddings
        chunk_data = []
        
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = f"{url_id}_chunk_{i}"
            
            chunk_data.append({
                "chunk_id": chunk_id,
                "url_id": url_id,
                "text": chunk,
                "embedding": embedding,  # This is a list of floats
                "metadata": metadata
            })
        
        # Store chunks
        chunks_key = sanitize_storage_key(f"embeddings/urls/{user_id}/{url_id}")
        db.storage.json.put(chunks_key, {"chunks": chunk_data})
        
        # Update URL metadata to mark as indexed
        url_meta_key = sanitize_storage_key(f"urls_meta/{user_id}")
        
        try:
            all_urls = db.storage.json.get(url_meta_key)
            print(f"[DEBUG] Updating URL {url_id} indexed status")
            print(f"[DEBUG] Pre-update URL metadata: {all_urls['urls'][0].keys()}")
            
            # Mark URL as indexed
            url_found = False
            for i, url in enumerate(all_urls["urls"]):
                if url["id"] == url_id:
                    url_found = True
                    print(f"[DEBUG] Found URL {url_id} at index {i}")
                    print(f"[DEBUG] Current indexed value: {url.get('indexed', 'NOT PRESENT')}")
                    print(f"[DEBUG] Setting indexed=True and chunk_count={len(chunks)}")
                    
                    # Explicit boolean assignment
                    all_urls["urls"][i]["indexed"] = True
                    all_urls["urls"][i]["chunk_count"] = len(chunks)
                    break
            
            if not url_found:
                print(f"[DEBUG] URL {url_id} not found in metadata!")
            
            # Store the updated metadata
            db.storage.json.put(url_meta_key, all_urls)
            print(f"[DEBUG] Updated URL metadata saved successfully")
            
            # Verify the update
            try:
                verification = db.storage.json.get(url_meta_key)
                for url in verification["urls"]:
                    if url["id"] == url_id:
                        print(f"[DEBUG] Verification - URL indexed value is now: {url.get('indexed', 'NOT PRESENT')}")
                        print(f"[DEBUG] Verification - URL indexed type: {type(url.get('indexed')).__name__}")
                        break
            except Exception as ve:
                print(f"[DEBUG] Verification failed: {str(ve)}")
        except Exception as e:
            print(f"Error updating URL metadata: {str(e)}")
        
        return True
    except Exception as e:
        print(f"Error storing URL embeddings: {str(e)}")
        return False

async def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

async def calculate_recency_score(date_str: str) -> float:
    """Calculate a recency score from 0-1 based on the date string
    Newer content gets a higher score"""
    try:
        # Parse ISO format date string
        date = datetime.datetime.fromisoformat(date_str)
        # Get current date
        now = datetime.datetime.now()
        # Calculate days difference
        days_diff = (now - date).days
        # Calculate recency score (1.0 for today, goes down over time)
        # Decay over 365 days (1 year)
        decay_period = 365.0
        recency_score = max(0.0, 1.0 - (days_diff / decay_period))
        return recency_score
    except Exception as e:
        print(f"Error calculating recency score: {str(e)}")
        return 0.5  # Default mid-range value for recency

async def calculate_composite_score(semantic_score: float, recency_score: Optional[float] = None, 
                                   credibility_score: Optional[float] = None, category_score: Optional[float] = None) -> float:
    """Calculate a composite score from individual ranking factors
    Weights each factor according to its importance"""
    # Define weights for each factor (sums to 1.0)
    semantic_weight = 0.60  # Semantic similarity is most important
    recency_weight = 0.15   # Recent content is somewhat important
    credibility_weight = 0.20  # Credibility is important for healthcare info
    category_weight = 0.05  # Category is least important
    
    # Start with semantic score, which is always available
    total_score = semantic_score * semantic_weight
    used_weight = semantic_weight
    
    # Add recency if available
    if recency_score is not None:
        total_score += recency_score * recency_weight
        used_weight += recency_weight
    
    # Add credibility if available
    if credibility_score is not None:
        total_score += credibility_score * credibility_weight
        used_weight += credibility_weight
    
    # Add category if available
    if category_score is not None:
        total_score += category_score * category_weight
        used_weight += category_weight
    
    # Normalize by dividing by the total weight used
    if used_weight > 0:
        normalized_score = total_score / used_weight
    else:
        normalized_score = semantic_score  # Fallback to semantic score
    
    return normalized_score

async def search_embeddings(user_id: str, query_embedding: List[float], top_k: int = 5, document_ids: Optional[List[str]] = None, url_ids: Optional[List[str]] = None, categories: Optional[List[str]] = None) -> List[SearchResult]:
    """Search for similar chunks based on embeddings with advanced ranking"""
    print(f"[DEBUG SEARCH] Starting search for user_id: {user_id}")
    
    # TEMPORARY FIX: If test-user-id is used, also search in the actual user's documents
    if user_id == "test-user-id":
        real_user_id = "v81muli0aIPaki39n9Ltt6gPW9z1"  # The actual user ID with data
        print(f"[DEBUG SEARCH] Using real user ID for testing: {real_user_id}")
        user_id = real_user_id
    
    results = []
    requested_categories = set(categories) if categories else set()
    
    # Search document embeddings
    doc_meta_key = sanitize_storage_key(f"documents_meta/{user_id}")
    try:
        all_docs = db.storage.json.get(doc_meta_key)
        
        # Filter documents by ID if provided
        filtered_docs = all_docs["documents"]
        if document_ids:
            filtered_docs = [doc for doc in filtered_docs if doc["id"] in document_ids]
        
        # Filter documents by category if provided
        if categories:
            filtered_docs = [doc for doc in filtered_docs if doc.get("category") in categories]
        
        # Search through indexed documents
        for doc in filtered_docs:
            if doc.get("indexed"):
                doc_id = doc["id"]
                doc_chunks_key = sanitize_storage_key(f"embeddings/documents/{user_id}/{doc_id}")
                
                try:
                    doc_chunks = db.storage.json.get(doc_chunks_key)
                    
                    for chunk in doc_chunks["chunks"]:
                        # Calculate semantic similarity score
                        semantic_score = float(await cosine_similarity(query_embedding, chunk["embedding"]))
                        
                        # Calculate recency score based on upload date
                        upload_date = doc.get("upload_date")
                        recency_score = await calculate_recency_score(upload_date) if upload_date else None
                        
                        # Calculate category score (1.0 if category is in requested categories)
                        doc_category = doc.get("category")
                        category_score = 1.0 if doc_category and doc_category in requested_categories else 0.5
                        
                        # For documents, we assume professional content but no explicit credibility score
                        # Use content type to estimate credibility (PDFs are often more formal documents)
                        content_type = doc.get("content_type", "")
                        credibility_score = 0.85 if "pdf" in content_type.lower() else 0.75
                        
                        # Calculate composite score
                        composite_score = await calculate_composite_score(
                            semantic_score=semantic_score,
                            recency_score=recency_score,
                            credibility_score=credibility_score,
                            category_score=category_score if categories else None
                        )
                        
                        # Add to results
                        results.append(SearchResult(
                            id=chunk["chunk_id"],
                            text=chunk["text"],
                            metadata={
                                **chunk["metadata"],
                                "document_id": doc_id,
                                "document_name": doc["filename"],
                                "upload_date": upload_date
                            },
                            score=composite_score,
                            source_type="document",
                            semantic_score=semantic_score,
                            recency_score=recency_score,
                            credibility_score=credibility_score,
                            category_score=category_score if categories else None
                        ))
                except Exception as e:
                    print(f"Error searching document {doc_id}: {str(e)}")
    except Exception as e:
        print(f"Error searching document embeddings: {str(e)}")
    
    # Search URL embeddings
    url_meta_key = sanitize_storage_key(f"urls_meta/{user_id}")
    try:
        all_urls = db.storage.json.get(url_meta_key)
        
        # Filter URLs by ID if provided
        filtered_urls = all_urls["urls"]
        if url_ids:
            filtered_urls = [url for url in filtered_urls if url["id"] in url_ids]
        
        # Filter URLs by category if provided
        if categories:
            filtered_urls = [url for url in filtered_urls if url.get("category") in categories]
        
        # Search through indexed URLs
        for url in filtered_urls:
            if url.get("indexed"):
                url_id = url["id"]
                url_chunks_key = sanitize_storage_key(f"embeddings/urls/{user_id}/{url_id}")
                
                try:
                    url_chunks = db.storage.json.get(url_chunks_key)
                    
                    for chunk in url_chunks["chunks"]:
                        # Calculate semantic similarity score
                        semantic_score = float(await cosine_similarity(query_embedding, chunk["embedding"]))
                        
                        # Calculate recency score based on added date
                        added_date = url.get("added_date")
                        recency_score = await calculate_recency_score(added_date) if added_date else None
                        
                        # Use explicit credibility score if available (normalize to 0-1 range)
                        raw_cred_score = url.get("credibility_score")
                        credibility_score = raw_cred_score / 5.0 if raw_cred_score else 0.6  # Default if not set
                        
                        # Calculate category score (1.0 if category is in requested categories)
                        url_category = url.get("category")
                        category_score = 1.0 if url_category and url_category in requested_categories else 0.5
                        
                        # Calculate composite score
                        composite_score = await calculate_composite_score(
                            semantic_score=semantic_score,
                            recency_score=recency_score,
                            credibility_score=credibility_score,
                            category_score=category_score if categories else None
                        )
                        
                        # Add to results
                        results.append(SearchResult(
                            id=chunk["chunk_id"],
                            text=chunk["text"],
                            metadata={
                                **chunk["metadata"],
                                "url_id": url_id,
                                "url": url["url"],
                                "url_title": url["title"],
                                "added_date": added_date,
                                "raw_credibility_score": raw_cred_score
                            },
                            score=composite_score,
                            source_type="url",
                            semantic_score=semantic_score,
                            recency_score=recency_score,
                            credibility_score=credibility_score,
                            category_score=category_score if categories else None
                        ))
                except Exception as e:
                    print(f"Error searching URL {url_id}: {str(e)}")
    except Exception as e:
        print(f"Error searching URL embeddings: {str(e)}")
    
    # Sort results by composite score (highest first) and limit to top_k
    results.sort(key=lambda x: x.score, reverse=True)
    return results[:top_k]

# Endpoints
@router.post("/index/document/{document_id}")
async def index_document(document_id: str, user: AuthorizedUser):
    """Extract text, chunk, and generate embeddings for a document"""
    try:
        # Get document metadata
        doc_response = await get_document(document_id=document_id, user=user)
        
        # Extract text from document
        text = await extract_text_from_document(user=user, document_id=document_id)
        
        if text.startswith("Error"):
            raise HTTPException(status_code=400, detail=text)
        
        # Split text into chunks
        chunks = await chunk_text(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No text chunks could be created from document")
        
        # Generate embeddings
        embeddings = await generate_embeddings(chunks)
        
        # Prepare metadata
        metadata = {
            "filename": doc_response.filename,
            "content_type": doc_response.content_type,
            "category": doc_response.category,
            "upload_date": doc_response.upload_date
        }
        
        # Store embeddings
        success = await store_document_embeddings(
            user_id=user.sub,
            document_id=document_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata=metadata
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to store document embeddings")
        
        return {"success": True, "message": f"Document indexed successfully with {len(chunks)} chunks"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error indexing document: {str(e)}")

@router.post("/index/url/{url_id}")
async def index_url(url_id: str, user: AuthorizedUser):
    """Scrape, chunk, and generate embeddings for a URL"""
    try:
        # Get URL metadata
        url_response = await get_url(url_id=url_id, user=user)
        
        # Scrape content from URL
        text = await scrape_url_content(user=user, url_id=url_id)
        
        if text.startswith("Error"):
            raise HTTPException(status_code=400, detail=text)
        
        # Split text into chunks
        chunks = await chunk_text(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No text chunks could be created from URL")
        
        # Generate embeddings
        embeddings = await generate_embeddings(chunks)
        
        # Prepare metadata
        metadata = {
            "title": url_response.title,
            "description": url_response.description,
            "category": url_response.category,
            "credibility_score": url_response.credibility_score,
            "added_date": url_response.added_date
        }
        
        # Store embeddings
        success = await store_url_embeddings(
            user_id=user.sub,
            url_id=url_id,
            chunks=chunks,
            embeddings=embeddings,
            metadata=metadata
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to store URL embeddings")
        
        return {"success": True, "message": f"URL indexed successfully with {len(chunks)} chunks"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error indexing URL: {str(e)}")

@router.post("/batch/documents")
async def batch_index_documents(user: AuthorizedUser, force: bool = False):
    """Index all documents for a user"""
    try:
        # Import document API functions
        from app.apis.documents import list_documents
        
        # Get all user's documents
        documents_response = await list_documents(user=user)
        documents = documents_response.documents
        
        # Track results
        results = {
            "total": len(documents),
            "indexed": 0,
            "failed": 0,
            "skipped": 0,
            "failures": []
        }
        
        # Process each document
        for doc in documents:
            # Skip already indexed documents unless force=True
            if not force and getattr(doc, "indexed", False):
                results["skipped"] += 1
                continue
                
            try:
                # Index the document
                await index_document(document_id=doc.id, user=user)
                results["indexed"] += 1
            except Exception as e:
                results["failed"] += 1
                results["failures"].append({
                    "document_id": doc.id,
                    "filename": doc.filename,
                    "error": str(e)
                })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error batch indexing documents: {str(e)}")

@router.post("/batch/urls")
async def batch_index_urls(user: AuthorizedUser, force: bool = False):
    """Index all URLs for a user"""
    try:
        # Import URL API functions
        from app.apis.urls import list_urls
        
        # Get all user's URLs
        urls_response = await list_urls(user=user)
        urls = urls_response.urls
        
        # Track results
        results = {
            "total": len(urls),
            "indexed": 0,
            "failed": 0,
            "skipped": 0,
            "failures": []
        }
        
        # Process each URL
        for url in urls:
            # Skip already indexed URLs unless force=True
            if not force and getattr(url, "indexed", False):
                results["skipped"] += 1
                continue
                
            try:
                # Index the URL
                await index_url(url_id=url.id, user=user)
                results["indexed"] += 1
            except Exception as e:
                results["failed"] += 1
                results["failures"].append({
                    "url_id": url.id,
                    "url": url.url,
                    "error": str(e)
                })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error batch indexing URLs: {str(e)}")

@router.post("/batch/all")
async def batch_index_all(user: AuthorizedUser, force: bool = False):
    """Index all documents and URLs for a user"""
    try:
        # Index documents
        doc_results = await batch_index_documents(user=user, force=force)
        
        # Index URLs
        url_results = await batch_index_urls(user=user, force=force)
        
        # Combine results
        results = {
            "documents": doc_results,
            "urls": url_results
        }
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error batch indexing all content: {str(e)}")

@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest, user: AuthorizedUser):
    """Search for relevant chunks based on a query"""
    try:
        # Generate embedding for the query
        query_embedding = (await generate_embeddings([request.query]))[0]
        
        # Search for similar chunks
        results = await search_embeddings(
            user_id=user.sub,
            query_embedding=query_embedding,
            top_k=request.top_k,
            document_ids=request.document_ids,
            url_ids=request.url_ids,
            categories=request.categories
        )
        
        return SearchResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching: {str(e)}")
