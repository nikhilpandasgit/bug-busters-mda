from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import *
from search_engine import SearchEngine
from file_parser import FileParser
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Mini Search System", version="1.0.0")
# app.mount("/static", StaticFiles(directory="static"), name="static")

# # Serve index.html at root
# app.mount("/", StaticFiles(directory="static", html=True), name="html")

# @app.get("/")
# async def serve_react():
#     return FileResponse(os.path.join("static", "index.html"))
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize search engine
search_engine = SearchEngine()
file_parser = FileParser()

@app.get("/")
async def root():
    return {"message": "Mini Search System API"}

@app.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and index a file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Check file type
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['txt', 'pdf', 'csv', 'json']:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload TXT, PDF, CSV, or JSON files."
        )

    try:
        # Read file content
        content = await file.read()

        # Parse file based on type
        if file_extension == 'txt':
            chunks = file_parser.parse_txt(content)
        elif file_extension == 'pdf':
            chunks = file_parser.parse_pdf(content)
        elif file_extension == 'csv':
            chunks = file_parser.parse_csv(content)
        elif file_extension == 'json':
            chunks = file_parser.parse_json(content)

        # Add to search engine
        search_engine.add_file(file.filename, chunks)

        return FileUploadResponse(
            filename=file.filename,
            status="success",
            chunks_created=len(chunks)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/search", response_model=SearchResponse)
async def search_files(query: SearchQuery):
    """Search across all uploaded files"""
    if not query.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        results = search_engine.search(query.query.strip())
        return SearchResponse(**results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.get("/search-history")
async def get_search_history():
    """Get recent search history"""
    return {"history": search_engine.get_search_history()}

@app.get("/files")
async def get_uploaded_files():
    """Get list of uploaded files"""
    files = []
    for filename, chunks in search_engine.files_data.items():
        file_type = filename.split('.')[-1].lower()
        files.append({
            "filename": filename,
            "file_type": file_type,
            "chunks_count": len(chunks)
        })
    return {"files": files}

@app.delete("/files/{filename}", status_code=204)
async def delete_file(filename: str):
    """Delete an uploaded file from the index"""
    if filename not in search_engine.files_data:
        raise HTTPException(status_code=404, detail="File not found")

    # Remove file from search engine's in-memory store
    del search_engine.files_data[filename]
    search_engine._update_vectors()  # Rebuild search vectors after deletion

    return None



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
