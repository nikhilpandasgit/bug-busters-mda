import re
import time
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SearchEngine:
    def __init__(self):
        self.files_data: Dict[str, List[Dict[str, Any]]] = {}
        self.search_history: List[str] = []
        self.vectorizer = None
        self.file_vectors = {}
    
    def add_file(self, filename: str, chunks: List[Dict[str, Any]]):
        """Add a parsed file to the search index"""
        self.files_data[filename] = chunks
        self._update_vectors()
    
    def _update_vectors(self):
        """Update TF-IDF vectors for semantic search"""
        all_texts = []
        file_chunk_mapping = {}
        
        for filename, chunks in self.files_data.items():
            for chunk in chunks:
                text = f"{chunk.get('title', '')} {chunk.get('content', '')}"
                all_texts.append(text)
                file_chunk_mapping[len(all_texts) - 1] = (filename, chunk)
        
        if all_texts:
            self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
            vectors = self.vectorizer.fit_transform(all_texts)
            self.file_vectors = {
                'vectors': vectors,
                'mapping': file_chunk_mapping
            }
    
    def search(self, query: str) -> Dict[str, Any]:
        """Perform search across all files"""
        start_time = time.time()
        
        # Add to search history
        if query not in self.search_history:
            self.search_history.append(query)
            if len(self.search_history) > 5:
                self.search_history.pop(0)
        
        results = []
        suggestions = []
        
        if not self.files_data:
            return {
                'query': query,
                'results': [],
                'total_files_searched': 0,
                'suggestions': ['Please upload some files first'],
                'search_time_ms': (time.time() - start_time) * 1000
            }
        
        # Perform keyword search
        keyword_results = self._keyword_search(query)
        
        # Perform semantic search
        semantic_results = self._semantic_search(query)
        
        # Merge and rank results
        merged_results = self._merge_results(keyword_results, semantic_results)
        
        # Generate suggestions if no results
        if not merged_results:
            suggestions = self._generate_suggestions(query)
        
        search_time_ms = (time.time() - start_time) * 1000
        
        return {
            'query': query,
            'results': merged_results,
            'total_files_searched': len(self.files_data),
            'suggestions': suggestions,
            'search_time_ms': search_time_ms
        }
    
    def _keyword_search(self, query: str) -> Dict[str, List[Dict[str, Any]]]:
        """Perform keyword-based search"""
        results = defaultdict(list)
        query_lower = query.lower()
        query_words = re.findall(r'\b\w+\b', query_lower)
        
        for filename, chunks in self.files_data.items():
            for chunk in chunks:
                score = 0
                matches = []
                
                # Search in title
                title = chunk.get('title', '').lower()
                if query_lower in title:
                    score += 3
                    matches.append(('title', chunk.get('title', '')))
                
                # Search in content
                content = chunk.get('content', '').lower()
                if query_lower in content:
                    score += 2
                    # Extract snippet around match
                    snippet = self._extract_snippet(chunk.get('content', ''), query)
                    matches.append(('content', snippet))
                
                # Word-by-word search
                for word in query_words:
                    if word in title:
                        score += 1
                    if word in content:
                        score += 1
                
                if score > 0:
                    results[filename].append({
                        'chunk': chunk,
                        'score': score,
                        'matches': matches,
                        'type': 'keyword'
                    })
        
        return results
    
    def _semantic_search(self, query: str) -> Dict[str, List[Dict[str, Any]]]:
        """Perform semantic search using TF-IDF"""
        results = defaultdict(list)
        
        if not self.vectorizer or not self.file_vectors:
            return results
        
        try:
            query_vector = self.vectorizer.transform([query])
            similarities = cosine_similarity(query_vector, self.file_vectors['vectors']).flatten()
            
            # Get top matches with similarity > 0.1
            top_indices = np.where(similarities > 0.1)[0]
            top_indices = sorted(top_indices, key=lambda x: similarities[x], reverse=True)
            
            for idx in top_indices[:20]:  # Limit to top 20 semantic matches
                similarity_score = similarities[idx]
                filename, chunk = self.file_vectors['mapping'][idx]
                
                results[filename].append({
                    'chunk': chunk,
                    'score': similarity_score * 10,  # Scale for comparison with keyword scores
                    'matches': [('semantic', self._extract_snippet(chunk.get('content', ''), query))],
                    'type': 'semantic'
                })
        except Exception as e:
            print(f"Semantic search error: {e}")
        
        return results
    
    def _merge_results(self, keyword_results: Dict, semantic_results: Dict) -> List[Dict[str, Any]]:
        """Merge and deduplicate keyword and semantic search results"""
        all_results = defaultdict(list)
        
        # Combine results from both search types
        for filename in set(list(keyword_results.keys()) + list(semantic_results.keys())):
            seen_chunks = set()
            
            # Add keyword results
            for result in keyword_results.get(filename, []):
                chunk_id = result['chunk'].get('chunk_id')
                if chunk_id not in seen_chunks:
                    all_results[filename].append(result)
                    seen_chunks.add(chunk_id)
            
            # Add semantic results (only if not already added)
            for result in semantic_results.get(filename, []):
                chunk_id = result['chunk'].get('chunk_id')
                if chunk_id not in seen_chunks:
                    all_results[filename].append(result)
                    seen_chunks.add(chunk_id)
            
            # Sort by score
            all_results[filename].sort(key=lambda x: x['score'], reverse=True)
        
        # Convert to final format
        final_results = []
        for filename, matches in all_results.items():
            if matches:
                file_type = filename.split('.')[-1].lower()
                final_results.append({
                    'file_name': filename,
                    'file_type': file_type,
                    'matches': [
                        {
                            'title': match['chunk'].get('title', ''),
                            'content': self._extract_snippet(match['chunk'].get('content', ''), ''),
                            'score': round(match['score'], 2),
                            'type': match['type'],
                            'matches': match['matches']
                        }
                        for match in matches[:5]  # Limit to top 5 per file
                    ],
                    'total_matches': len(matches)
                })
        
        # Sort files by best match score
        final_results.sort(key=lambda x: max([m['score'] for m in x['matches']], default=0), reverse=True)
        
        return final_results
    
    def _extract_snippet(self, text: str, query: str, max_length: int = 150) -> str:
        """Extract a snippet around the query match"""
        if not text or not query:
            return text[:max_length] + ('...' if len(text) > max_length else '')
        
        text_lower = text.lower()
        query_lower = query.lower()
        
        # Find the position of the query in the text
        pos = text_lower.find(query_lower)
        if pos == -1:
            # If exact query not found, return beginning of text
            return text[:max_length] + ('...' if len(text) > max_length else '')
        
        # Calculate snippet boundaries
        start = max(0, pos - max_length // 3)
        end = min(len(text), pos + len(query) + max_length // 3)
        
        snippet = text[start:end]
        if start > 0:
            snippet = '...' + snippet
        if end < len(text):
            snippet = snippet + '...'
        
        return snippet
    
    def _generate_suggestions(self, query: str) -> List[str]:
        """Generate search suggestions when no results found"""
        suggestions = [
            "Try different keywords",
            "Check your spelling",
            "Use simpler terms",
            "Try searching for partial words"
        ]
        
        # Add suggestions based on available content
        if self.files_data:
            common_words = set()
            for chunks in self.files_data.values():
                for chunk in chunks:
                    content = chunk.get('content', '').lower()
                    words = re.findall(r'\b\w+\b', content)
                    common_words.update(words[:10])  # Add first 10 words from each chunk
            
            # Suggest similar words (simple approach)
            query_words = query.lower().split()
            for word in query_words:
                similar = [w for w in common_words if w.startswith(word[:2]) and w != word]
                if similar:
                    suggestions.append(f"Try '{similar[0]}' instead of '{word}'")
                    break
        
        return suggestions[:5]
    
    def get_search_history(self) -> List[str]:
        """Get recent search history"""
        return self.search_history[-5:]
