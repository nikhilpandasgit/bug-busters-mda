from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class FileUploadResponse(BaseModel):
    filename: str
    status: str
    chunks_created: int

class SearchQuery(BaseModel):
    query: str

class SearchResult(BaseModel):
    file_name: str
    file_type: str
    matches: List[Dict[str, Any]]
    total_matches: int

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_files_searched: int
    suggestions: List[str]
    search_time_ms: float
