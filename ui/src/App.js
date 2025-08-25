import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Paper,
    Divider,
    Button
} from '@mui/material';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import SearchHistory from './components/SearchHistory';
import SearchResults from './components/SearchResults';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        background: {
            default: '#f5f5f5'
        }
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
            const response = await fetch('http://localhost:8000/search-history');
            const data = await response.json();
            setSearchHistory(data.history);
        } catch (error) {
            console.error('Error fetching search history:', error);
        }
    };

    const fetchUploadedFiles = async () => {
        try {
            const response = await fetch('http://localhost:8000/files');
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
            const response = await fetch(`http://localhost:8000/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchUploadedFiles();   // Refresh the uploaded files list
                setSearchResults(null); // Optional: clear search results related to deleted files
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
            const response = await fetch('http://localhost:8000/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
                fetchSearchHistory(); // Refresh search history
            } else {
                console.error('Search failed');
            }
        } catch (error) {
            console.error('Error during search:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = () => {
        fetchUploadedFiles(); // Refresh file list after upload
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
                    📚 Knowledge Based Search System
                </Typography>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <FileUpload onUploadSuccess={handleFileUpload} />

                    {uploadedFiles.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Uploaded Files:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {uploadedFiles.map((file) => (
                                    <Box
                                        key={file.filename}
                                        sx={{
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                            px: 1,
                                            py: 0.2,
                                            display: 'flex',
                                            alignItems: 'center',
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

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                    <SearchHistory
                        history={searchHistory}
                        onHistoryClick={handleSearch}
                    />
                </Paper>

                {searchResults && (
                    <SearchResults
                        results={searchResults}
                        loading={loading}
                    />
                )}
            </Container>
        </ThemeProvider>
    );
}

export default App;
