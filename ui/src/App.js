import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Button,
  GlobalStyles,
} from "@mui/material";
import FileUpload from "./components/FileUpload";
import SearchBar from "./components/SearchBar";
import SearchHistory from "./components/SearchHistory";
import SearchResults from "./components/SearchResults";

// ✅ Theme with Gilmer font
const theme = createTheme({
  typography: {
    fontFamily: "Gilmer, Arial, sans-serif",
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchSearchHistory();
    fetchUploadedFiles();
  }, []);

    const fetchSearchHistory = async () => {
        try {
            const response = await fetch('https://mini-search-engine-17k8.onrender.com/search-history');
            const data = await response.json();
            setSearchHistory(data.history);
        } catch (error) {
            console.error('Error fetching search history:', error);
        }
    };

    const fetchUploadedFiles = async () => {
        try {
            const response = await fetch('https://mini-search-engine-17k8.onrender.com/files');
            const data = await response.json();
            setUploadedFiles(data.files);
        } catch (error) {
            console.error('Error fetching uploaded files:', error);
        }
    };

    const handleDeleteFile = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }
        try {
            const response = await fetch(`https://mini-search-engine-17k8.onrender.com/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchUploadedFiles();
                setSearchResults(null);
            } else {
                alert('Failed to delete the file.');
            }
        } catch (error) {
            alert(`Error deleting file: ${error.message}`);
        }
    };

  const handleSearch = async (query) => {
    if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('https://mini-search-engine-17k8.onrender.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        fetchSearchHistory();
      } else {
        console.error("Search failed");
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = () => {
    fetchUploadedFiles();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ✅ Global Styles for Background & Font */}
      <GlobalStyles
        styles={{
          "@font-face": [
            {
              fontFamily: "Gilmer",
              src: `
                            url('/fonts/Gilmer-Regular.woff2') format('woff2'),
                            url('/fonts/Gilmer-Regular.ttf') format('truetype')
                        `,
              fontWeight: 400,
              fontStyle: "normal",
            },
            {
              fontFamily: "Gilmer",
              src: `
                            url('/fonts/Gilmer-Bold.woff2') format('woff2'),
                            url('/fonts/Gilmer-Bold.ttf') format('truetype')
                        `,
              fontWeight: 700,
              fontStyle: "normal",
            },
          ],
          body: {
            background:
              "radial-gradient(circle at 0% 0%, #e4b795, #699acd, #2f679f)",
            minHeight: "100vh",
            margin: 0,
            fontFamily: "Gilmer, Arial, sans-serif",
          },
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* ✅ White Heading with 📚 */}
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            color: "#fff",
            fontFamily: "Gilmer, Arial, sans-serif",
            fontWeight: 700,
          }}
        >
          <div class="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="70"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-brain h-8 w-8 text-white"
              data-lov-id="src/pages/Index.tsx:116:14"
              data-lov-name="Brain"
              data-component-path="src/pages/Index.tsx"
              data-component-line="116"
              data-component-file="Index.tsx"
              data-component-name="Brain"
              data-component-content="%7B%22className%22%3A%22h-8%20w-8%20text-white%22%7D"
            >
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
              <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
              <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
              <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
              <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
              <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
              <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
            </svg>
            Mini Search Engine
          </div>
        </Typography>

        {/* File Upload Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <FileUpload onUploadSuccess={handleFileUpload} />
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Uploaded Files:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {uploadedFiles.map((file) => (
                  <Box
                    key={file.filename}
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      px: 1,
                      py: 0.2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2">{file.filename}</Typography>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeleteFile(file.filename)}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Search Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <SearchBar onSearch={handleSearch} loading={loading} />
          <SearchHistory
            history={searchHistory}
            onHistoryClick={handleSearch}
          />
        </Paper>

        {/* Search Results */}
        {searchResults && (
          <SearchResults results={searchResults} loading={loading} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
