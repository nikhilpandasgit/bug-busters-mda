import json
import csv
import PyPDF2
import pandas as pd
from typing import List, Dict, Any
import io
import re

class FileParser:
    @staticmethod
    def parse_txt(content: bytes) -> List[Dict[str, Any]]:
        """Parse plain text file into chunks"""
        text = content.decode('utf-8')
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        chunks = []
        for i, paragraph in enumerate(paragraphs):
            chunks.append({
                'type': 'paragraph',
                'content': paragraph,
                'chunk_id': i,
                'title': f"Paragraph {i+1}"
            })
        return chunks
    
    @staticmethod
    def parse_pdf(content: bytes) -> List[Dict[str, Any]]:
        """Parse PDF file into chunks"""
        chunks = []
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            if text.strip():
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                for i, paragraph in enumerate(paragraphs):
                    chunks.append({
                        'type': 'pdf_paragraph',
                        'content': paragraph,
                        'chunk_id': f"page_{page_num}_para_{i}",
                        'title': f"Page {page_num+1}, Paragraph {i+1}"
                    })
        return chunks
    
    @staticmethod
    def parse_csv(content: bytes) -> List[Dict[str, Any]]:
        """Parse CSV file into chunks"""
        text_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(text_content))
        
        chunks = []
        headers = csv_reader.fieldnames or []
        
        # Add headers as searchable content
        chunks.append({
            'type': 'csv_headers',
            'content': ' '.join(headers),
            'chunk_id': 'headers',
            'title': 'Column Headers'
        })
        
        # Add each row as a chunk
        for i, row in enumerate(csv_reader):
            row_content = ' '.join([f"{k}: {v}" for k, v in row.items() if v])
            chunks.append({
                'type': 'csv_row',
                'content': row_content,
                'chunk_id': f"row_{i}",
                'title': f"Row {i+1}",
                'raw_data': row
            })
        return chunks
    
    @staticmethod
    def parse_json(content: bytes) -> List[Dict[str, Any]]:
        """Parse JSON file into chunks"""
        text_content = content.decode('utf-8')
        data = json.loads(text_content)
        
        chunks = []
        
        def extract_chunks(obj, path="", chunk_id=0):
            nonlocal chunks
            
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    
                    if isinstance(value, (dict, list)):
                        extract_chunks(value, current_path, chunk_id)
                    else:
                        chunks.append({
                            'type': 'json_field',
                            'content': f"{key}: {value}",
                            'chunk_id': f"field_{len(chunks)}",
                            'title': current_path,
                            'key': key,
                            'value': str(value)
                        })
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    current_path = f"{path}[{i}]"
                    extract_chunks(item, current_path, chunk_id)
        
        extract_chunks(data)
        return chunks
