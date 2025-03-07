from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from openai import OpenAI
from typing import List, Optional, Dict, Any
import databutton as db
import json
import re
import pdfplumber
from app.apis.embeddings import search, SearchRequest
import io
from app.auth import AuthorizedUser
from datetime import datetime
import time
from app.apis.analytics import QueryMetrics
import asyncio

# Import documents API directly
from app.apis.documents import list_documents, get_document_content

router = APIRouter()

# Define models for API requests and responses
class ChatMessage(BaseModel):
    role: str  # Either 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class SourceMetadata(BaseModel):
    upload_date: Optional[str] = None  # For documents
    added_date: Optional[str] = None   # For URLs
    publication_date: Optional[str] = None
    credibility_rating: Optional[float] = None
    category: Optional[str] = None

class Source(BaseModel):
    # Core identification fields
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    url_id: Optional[str] = None
    url_title: Optional[str] = None
    excerpt: str
    source_type: Optional[str] = None
    
    # Individual scores
    score: Optional[float] = None              # Overall composite score
    semantic_score: Optional[float] = None     # Semantic relevance to query
    credibility_score: Optional[float] = None  # Source credibility rating
    recency_score: Optional[float] = None      # How recent the information is
    category_score: Optional[float] = None     # Relevance to requested categories
    
    # Legacy and additional data
    ranking_info: Optional[Dict[str, Any]] = None
    metadata: Optional[SourceMetadata] = None

class ChatResponse(BaseModel):
    message: str
    confidence_level: Optional[str] = None  # HIGH, MODERATE, LOW, or INSUFFICIENT
    sources: List[Source] = []

@router.post("/chat")
async def chat(request: ChatRequest, user: AuthorizedUser, fastapi_request: Request):
    start_time = time.time()
    try:
        # Get API key from secrets
        api_key = db.secrets.get("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        # Initialize OpenAI client
        client = OpenAI(api_key=api_key)

        # Use RAG search to find relevant content based on the user's query
        context = "Context information from repository:\n\n"
        used_document_ids = []

        try:
            # Debug log user ID
            print(f"[DEBUG CHAT] User ID: {user.sub}")

            # Prepare search request
            search_request = SearchRequest(
                query=request.message,
                top_k=5  # Get top 5 most relevant chunks
            )
            print(f"[DEBUG CHAT] Search request: {search_request}")

            # Search for relevant content
            print(f"[DEBUG CHAT] Calling search function...")
            search_response = await search(search_request, user)
            print(f"[DEBUG CHAT] Search response received with {len(search_response.results)} results")

            # Check if we have any results
            if search_response and search_response.results:
                print(f"[DEBUG CHAT] Search response has {len(search_response.results)} results")
                # Add each result to our context
                print(f"[DEBUG CHAT] Processing {len(search_response.results)} search results")
                for i, result in enumerate(search_response.results or []):
                    # Add source information
                    print(f"[DEBUG CHAT] Result {i} source_type: {result.source_type}")
                    if result.source_type == "document":
                        doc_id = result.metadata.get("document_id")
                        doc_name = result.metadata.get("document_name")
                        context += f"Document Name: {doc_name}\nDocument ID: {doc_id}\nContent:\n{result.text}\n\n"
                        used_document_ids.append(doc_id)
                    elif result.source_type == "url":
                        url_id = result.metadata.get("url_id")
                        url_title = result.metadata.get("url_title")
                        url = result.metadata.get("url")
                        context += f"URL ID: {url_id}\nTitle: {url_title}\nURL: {url}\nContent:\n{result.text}\n\n"
            else:
                # Fallback if no search results
                context += "No relevant information found in the repository for this query.\n\n"
        except Exception as e:
            print(f"[DEBUG CHAT] Error in RAG search: {str(e)}")
            import traceback
            print(f"[DEBUG CHAT] Traceback: {traceback.format_exc()}")
            # Fallback message if search fails
            context += "Unable to search the repository due to an error.\n\n"

        # Prepare conversation history for OpenAI
        openai_messages = []

        # Add system prompt
        system_prompt = """
        You are an AI assistant for healthcare professionals called MediVault AI. Your role is to provide accurate, evidence-based responses to medical questions using only the provided context information from the organization's document repository. 

        IMPORTANT GUIDELINES FOR AUTHORITATIVE RESPONSES:
        1. Only use information contained in the provided context. If the context doesn't contain relevant information, say so clearly.
        2. Always cite your sources using the Document Names provided in the context.
        3. When citing information, specify which document it came from in the format [Document: Document Name].
        4. Be concise, professional, and authoritative in your responses.
        5. Format your response with proper Markdown for optimal readability:
           - Always add a blank line after each paragraph
           - Always add a blank line before starting a bullet list
           - Use proper Markdown bullet points (*, -, or numbers followed by a space)
           - Maintain consistent indentation for nested lists
           - Use Markdown headers (# and ##) for section titles
        6. If you're unsure about information or it's not in the context, acknowledge limitations rather than making assumptions.
        7. Always prioritize patient safety in your responses.
        8. When multiple sources provide different perspectives, clearly articulate the consensus view if one exists.
        9. Prioritize information from peer-reviewed journals, clinical guidelines, and official medical organizations over other sources.
        10. Explicitly state your confidence level for each response using one of these labels at the beginning:
            - [HIGH CONFIDENCE]: When information is consistent across multiple authoritative sources
            - [MODERATE CONFIDENCE]: When limited but reliable information is available
            - [LOW CONFIDENCE]: When information is limited, outdated, or from lower quality sources
            - [INSUFFICIENT DATA]: When the repository lacks adequate information to form a conclusion
        11. For medical recommendations, always indicate whether they represent standard practice, emerging approaches, or experimental treatments.
        12. When information in sources is outdated, explicitly acknowledge this limitation.

        FORMATTING EXAMPLES:
        1. For paragraphs with proper spacing:

        "[HIGH CONFIDENCE] Based on multiple clinical guidelines, metformin is the first-line medication for type 2 diabetes [Document: Diabetes Management Guidelines 2023].

        It works by reducing glucose production in the liver and improving insulin sensitivity [Document: Pharmacology of Diabetes Medications]. This recommendation has strong consensus across all major diabetes management frameworks."

        2. For bullet points with proper spacing:

        "[HIGH CONFIDENCE] The key symptoms of early onset diabetes include:

        * Increased thirst and frequent urination [Document: Diabetes Diagnostic Criteria]
        * Unexplained weight loss despite normal or increased appetite [Document: Diabetes Diagnostic Criteria]
        * Fatigue and weakness [Document: Diabetes Diagnostic Criteria]
        * Blurred vision [Document: Diabetes Diagnostic Criteria]"

        3. For insufficient data response:

        "[INSUFFICIENT DATA] The context information doesn't contain specific guidelines about this procedure.

        While I found some general information about the topic [Document: Healthcare Procedures Overview], there are no detailed protocols for implementation in your repository. I recommend consulting your organization's official protocols or speaking with a specialist."
        """

        # Add system message
        openai_messages.append({"role": "system", "content": system_prompt})

        # Add conversation history
        if request.conversation_history is not None:
            for msg in request.conversation_history:
                openai_messages.append({"role": msg.role, "content": msg.content})

        # Prepare the user message with context
        user_message = f"""I need information about: {request.message}

        {context}
        """

        # Add the current message to the conversation
        openai_messages.append({"role": "user", "content": user_message})

        # Call OpenAI API
        print(f"[DEBUG CHAT] Calling OpenAI API with {len(openai_messages)} messages")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=openai_messages,
            max_tokens=1500,
            temperature=0.0
        )

        # Extract response text
        response_text = response.choices[0].message.content
        print(f"[DEBUG CHAT] Got response from OpenAI: {response_text[:100]}...")

        # Process the response into structured format with sections
        def format_structured_response(text, query, sources):
            # Remove extra newlines at the beginning
            text = text.strip()

            # Extract confidence level if present
            confidence_level = "INSUFFICIENT DATA"
            confidence_patterns = {
                '[HIGH CONFIDENCE]': "Green", 
                '[MODERATE CONFIDENCE]': "Amber", 
                '[LOW CONFIDENCE]': "Red", 
                '[INSUFFICIENT DATA]': "Red"
            }

            for pattern, rating in confidence_patterns.items():
                if pattern in text[:100]:
                    confidence_level = pattern.strip('[]')
                    text = text.replace(pattern, "", 1).strip()
                    break

            # Format text for better readability
            formatted_content = ""
            lines = text.split('\n')

            # Ultra-simple formatting that maintains bullet point structure
            formatted_text = ""
            
            # First pass: combine lines into paragraphs but keep bullet points separate
            current_paragraph = []
            in_bullet_list = False
            
            for line in lines:
                line = line.strip()
                is_bullet = bool(re.match(r'^\s*[\*\-]\s+', line))
                
                # Handle bullet point transitions
                if is_bullet:
                    # If we were building a paragraph, finish it
                    if current_paragraph:
                        formatted_text += " ".join(current_paragraph) + "\n\n"
                        current_paragraph = []
                    
                    # Add the bullet point
                    if not in_bullet_list and formatted_text and not formatted_text.endswith("\n\n"):
                        formatted_text += "\n"
                    formatted_text += line + "\n"
                    in_bullet_list = True
                # Handle regular text
                elif line:
                    # If we're transitioning out of a bullet list
                    if in_bullet_list:
                        in_bullet_list = False
                        if not formatted_text.endswith("\n\n"):
                            formatted_text += "\n"
                    
                    # Add to current paragraph
                    current_paragraph.append(line)
                # Handle empty lines
                elif current_paragraph:
                    # Finish the current paragraph
                    formatted_text += " ".join(current_paragraph) + "\n\n"
                    current_paragraph = []
            
            # Add any final paragraph
            if current_paragraph:
                formatted_text += " ".join(current_paragraph)
            
            # Convert back to lines for final formatting
            formatted_lines = formatted_text.split("\n")
            previous_empty = False
            for line in formatted_lines:
                if not line:
                    if not previous_empty:
                        formatted_content += "\n\n"
                        previous_empty = True
                else:
                    formatted_content += line + "\n\n"
                    previous_empty = False

            formatted_content = formatted_content.strip()

            # No need to build source references in the response text as they will be displayed separately in the UI
            # This prevents duplication of sources

            # Map confidence level to RAG rating
            rag_rating_map = {
                "HIGH CONFIDENCE": "Green",
                "MODERATE CONFIDENCE": "Amber",
                "LOW CONFIDENCE": "Red",
                "INSUFFICIENT DATA": "Red"
            }

            rag_rating = rag_rating_map.get(confidence_level, "Red")

            # Generate explanation based on confidence level
            explanation = ""
            if rag_rating == "Green":
                explanation = "This response is based on high-quality source material that directly addresses your query with reliable information."
            elif rag_rating == "Amber":
                explanation = "This response is based on related sources, but may not fully address all aspects of your query or may come from less authoritative sources."
            elif rag_rating == "Red":
                explanation = "This response has limited or no supporting evidence in the knowledge base. Consider consulting additional sources or refining your query."

            # Determine if next steps are needed
            next_steps = ""
            if rag_rating != "Green":
                next_steps = "\n\n### Actionable Next Steps\n\n"
                if rag_rating == "Red":
                    next_steps += "- Consider consulting a healthcare professional for more specific information\n"
                    next_steps += "- Your organization may want to add more resources on this topic to the knowledge base\n"
                    next_steps += "- Try rephrasing your query to be more specific\n"
                elif rag_rating == "Amber":
                    next_steps += "- Review the provided sources for partial information\n"
                    next_steps += "- Consider consulting additional clinical resources for complete information\n"

            # Construct the final structured response
            structured_response = f"""### Query

{query}

### Response

{formatted_content}

### RAG Confidence Rating: {rag_rating}

{explanation}{next_steps}"""

            return structured_response

        # Extract document and URL citations in format [Document: XXX] and [URL: XXX]
        doc_name_citations = re.findall(r'\[Document: ([^\]]+)\]', response_text)
        url_citations = re.findall(r'\[URL: ([^\]]+)\]', response_text)
        
        # Legacy format for backward compatibility
        doc_id_citations = re.findall(r'\[Document ID: ([^\]]+)\]', response_text)
        
        print(f"[DEBUG CHAT] Found citations: doc_names={doc_name_citations}, urls={url_citations}, doc_ids={doc_id_citations}")
        print(f"[DEBUG CHAT] Used document IDs: {used_document_ids}")
        
        # Initialize sources list
        sources = []
        
        # Get the search results to use as sources
        try:
            # Search again with the same query to get the same results
            # We do this to avoid passing too much data between functions
            search_request = SearchRequest(
                query=request.message,
                top_k=5
            )
            
            search_response = await search(search_request, user)
            print(f"[DEBUG CHAT] Got {len(search_response.results or [])} search results for source extraction")
            
            # Include ALL relevant search results as sources if we have citations
            # This is important because we want to show all sources that contributed to the answer
            if doc_name_citations or url_citations or doc_id_citations or used_document_ids:
                for result in search_response.results or []:
                    if result.source_type == "document":
                        doc_id = result.metadata.get("document_id") if result.metadata else None
                        doc_name = result.metadata.get("document_name", "Unknown Document") if result.metadata else "Unknown Document"
                        
                        # Add any document that's related to the query as a source
                        sources.append(Source(
                            document_id=doc_id or "",
                            document_name=doc_name,
                            excerpt=result.text[:300] + "..." if len(result.text) > 300 else result.text,
                            source_type="document",
                            
                            # Direct access scores for new UI
                            score=round(result.score, 2) if result.score is not None else None,
                            semantic_score=round(result.semantic_score, 2) if result.semantic_score is not None else None,
                            credibility_score=round(result.credibility_score, 2) if result.credibility_score is not None else None,
                            recency_score=round(result.recency_score, 2) if result.recency_score is not None else None,
                            category_score=round(result.category_score, 2) if result.category_score is not None else None,
                            
                            # Legacy ranking info structure for backward compatibility
                            ranking_info={
                                "semantic_score": round(result.semantic_score, 2) if result.semantic_score is not None else None,
                                "recency_score": round(result.recency_score, 2) if result.recency_score is not None else None,
                                "credibility_score": round(result.credibility_score, 2) if result.credibility_score is not None else None,
                                "category_score": round(result.category_score, 2) if result.category_score is not None else None,
                                "composite_score": round(result.score, 2) if result.score is not None else None
                            },
                            
                            # Metadata object
                            metadata=SourceMetadata(
                                upload_date=result.metadata.get("upload_date") if result.metadata else None,
                                publication_date=result.metadata.get("publication_date") if result.metadata else None,
                                credibility_rating=result.metadata.get("credibility_rating") if result.metadata else None,
                                category=result.metadata.get("category") if result.metadata else None
                            )
                        ))
                    elif result.source_type == "url":
                        url_id = result.metadata.get("url_id") if result.metadata else None
                        url_title = result.metadata.get('url_title', 'Unknown URL') if result.metadata else 'Unknown URL'
                        url = result.metadata.get('url', '') if result.metadata else ''
                        
                        # Add any URL that's related to the query as a source
                        sources.append(Source(
                            # Store URL ID in both fields for compatibility
                            url_id=url_id or "",
                            document_id=url_id or "",  # Backward compatibility
                            url_title=url_title,
                            document_name=f"{url_title} ({url})",  # Backward compatibility
                            excerpt=result.text[:300] + "..." if len(result.text) > 300 else result.text,
                            source_type="url",
                            
                            # Direct access scores for new UI
                            score=round(result.score, 2) if result.score is not None else None,
                            semantic_score=round(result.semantic_score, 2) if result.semantic_score is not None else None,
                            credibility_score=round(result.credibility_score, 2) if result.credibility_score is not None else None,
                            recency_score=round(result.recency_score, 2) if result.recency_score is not None else None,
                            category_score=round(result.category_score, 2) if result.category_score is not None else None,
                            
                            # Legacy ranking info structure for backward compatibility
                            ranking_info={
                                "semantic_score": round(result.semantic_score, 2) if result.semantic_score is not None else None,
                                "recency_score": round(result.recency_score, 2) if result.recency_score is not None else None,
                                "credibility_score": round(result.credibility_score, 2) if result.credibility_score is not None else None,
                                "category_score": round(result.category_score, 2) if result.category_score is not None else None,
                                "composite_score": round(result.score, 2) if result.score is not None else None
                            },
                            
                            # Metadata object
                            metadata=SourceMetadata(
                                added_date=result.metadata.get("added_date") if result.metadata else None,
                                credibility_rating=result.metadata.get("raw_credibility_score") if result.metadata else None,
                                category=result.metadata.get("category") if result.metadata else None
                            )
                        ))
            
            print(f"[DEBUG CHAT] Created {len(sources)} source objects")

        except Exception as e:
            print(f"Error creating source references: {str(e)}")
            
        # Apply structured formatting
        response_text = format_structured_response(response_text, request.message, sources)

        # Extract confidence level from response
        confidence_level = None
        confidence_patterns = [
            r'\[(HIGH CONFIDENCE)\]',
            r'\[(MODERATE CONFIDENCE)\]',
            r'\[(LOW CONFIDENCE)\]',
            r'\[(INSUFFICIENT DATA)\]'
        ]

        for pattern in confidence_patterns:
            match = re.search(pattern, response_text)
            if match:
                confidence_level = match.group(1)
                break

        # Calculate query metrics for analytics
        processing_time_ms = int((time.time() - start_time) * 1000)

        # Calculate average scores from sources
        semantic_scores = [s.ranking_info.get("semantic_score") for s in sources if s.ranking_info and s.ranking_info.get("semantic_score") is not None]
        avg_semantic_score = sum(semantic_scores) / len(semantic_scores) if semantic_scores else None

        credibility_scores = [s.ranking_info.get("credibility_score") for s in sources if s.ranking_info and s.ranking_info.get("credibility_score") is not None]
        avg_credibility_score = sum(credibility_scores) / len(credibility_scores) if credibility_scores else None

        recency_scores = [s.ranking_info.get("recency_score") for s in sources if s.ranking_info and s.ranking_info.get("recency_score") is not None]
        avg_recency_score = sum(recency_scores) / len(recency_scores) if recency_scores else None

        # Count source types
        source_types = {}
        for result in search_response.results or []:
            if result.source_type:
                source_types[result.source_type] = source_types.get(result.source_type, 0) + 1

        # Check for potential hallucinations (simple heuristic: if confidence is low but no sources)
        hallucination_detected = len(sources) == 0 and confidence_level not in ["INSUFFICIENT DATA", None]

        # Create metrics object
        metrics = QueryMetrics(
            query=request.message,
            timestamp=datetime.now().isoformat(),
            user_id=user.sub,
            confidence_level=confidence_level,
            response_length=len(response_text),
            processing_time_ms=processing_time_ms,
            num_sources=len(sources),
            avg_semantic_score=avg_semantic_score,
            avg_credibility_score=avg_credibility_score,
            avg_recency_score=avg_recency_score,
            source_types=source_types,
            hallucination_detected=hallucination_detected
        )

        # Log metrics asynchronously (don't wait for it to complete)
        try:
            from app.apis.analytics import log_query
            asyncio.create_task(log_query(metrics, user))
        except Exception as e:
            print(f"Error logging chat metrics: {str(e)}")

        response = ChatResponse(
            message=response_text,
            confidence_level=confidence_level,
            sources=sources
        )

        return response

    except Exception as e:
        error_msg = f"Error in chat endpoint: {str(e)}"
        print(error_msg)
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        # Print request details for debugging
        print(f"Request message: {request.message}")
        if request.conversation_history is not None:
            print(f"Request history length: {len(request.conversation_history)}")
        else:
            print("Request history is None")
        raise HTTPException(status_code=500, detail=error_msg)
