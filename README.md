# 📚 Mini Search System

A Google-like solution for searching organizational documents (PDF, CSV, JSON, TXT) with smart keyword and semantic capabilities, built with **FastAPI** (backend) and **React** (frontend).

---

## 🚀 Features
- **Multi-Format Support**: Upload and search across TXT, PDF, CSV, and JSON files.  
- **Intelligent Search**: Keyword search and semantic search using TF-IDF embeddings.  
- **Smart Result Grouping**: Results grouped by file, context snippets, and highlighted matches.  
- **Search History**: Last 5 queries stored as quick-access chips.  
- **Suggestions Engine**: Auto-suggests queries/tips when no result is found.  
- **Modern UI**: Responsive React frontend with Material-UI.  

---

## 🛠️ Technology Stack
**Frontend**: React, Material-UI, Axios  
**Backend**: FastAPI, Uvicorn  
**In-Memory Search Engine**: Python, Scikit-learn (TF-IDF)  
**Document Parsing**: PyPDF2, pandas  
**Others**: python-multipart, numpy  

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mini-search-system.git
cd mini-search-system
```

### 2. Backend setup (with virtual environment)
```bash
cd backend
python -m venv search_env

# Activate:
# Windows
search_env\Scripts\activate
# macOS/Linux
source search_env/bin/activate

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Start backend server
python main.py
# Runs on http://localhost:8000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 💡 Usage
1. **Upload Documents**: Use the frontend to upload PDF, CSV, JSON, or TXT files.  
2. **Search**: Enter keywords or phrases. The engine searches all uploaded files, keywords and semantics included.  
3. **View Results**: See results grouped by file with highlighted snippets.  
4. **Recent Searches**: Quickly re-run your last 5 queries with one click.  
5. **Suggestions**: If no results are found, the app offers helpful search tips or related term suggestions.  

---

## 🏗 Project Structure
```
mini-search-system/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── search_engine.py
│   ├── file_parser.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── FileUpload.js
│   │   │   ├── SearchBar.js
│   │   │   ├── SearchHistory.js
│   │   │   └── SearchResults.js
│   │   └── index.js
│   ├── package.json
└── README.md
```

---

## 🧑‍💻 Development Notes
- Data is stored and indexed **in-memory** (no database needed).  
- Extend semantic search with advanced models if your dataset grows larger.  
- No external vector database required; semantic search uses **Scikit-learn's TF-IDF in-memory**.  

---

## ⚙️ API Endpoints
- **POST /upload** — Upload and parse new document  
- **POST /search** — Search all indexed files  
- **GET /search-history** — Get the last 5 user search queries  
- **GET /files** — List indexed files  
