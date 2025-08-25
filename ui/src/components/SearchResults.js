import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider
} from '@mui/material';
import { ExpandMore, Description, TextSnippet } from '@mui/icons-material';

const SearchResults = ({ results, loading }) => {
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography>Searching...</Typography>
      </Paper>
    );
  }

  if (!results) {
    return null;
  }

  const { query, results: searchResults, total_files_searched, suggestions, search_time_ms } = results;

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? 
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>{part}</mark> : 
        part
    );
  };

  const getFileTypeIcon = (fileType) => {
    return <Description />;
  };

  const getMatchTypeColor = (type) => {
    return type === 'keyword' ? 'primary' : 'secondary';
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Search Results for "{query}"
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Found {searchResults.reduce((total, file) => total + file.total_matches, 0)} matches 
          across {searchResults.length} files in {search_time_ms.toFixed(2)}ms
          {total_files_searched > 0 && ` (searched ${total_files_searched} files)`}
        </Typography>
      </Box>

      {searchResults.length === 0 ? (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            No results found for "{query}"
          </Alert>
          {suggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Suggestions:
              </Typography>
              {suggestions.map((suggestion, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  • {suggestion}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          {searchResults.map((file, fileIndex) => (
            <Accordion key={fileIndex} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {getFileTypeIcon(file.file_type)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {file.file_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {file.total_matches} matches • {file.file_type.toUpperCase()} file
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${file.matches.length} shown`} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                {file.matches.map((match, matchIndex) => (
                  <Box key={matchIndex}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          <TextSnippet sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                          {match.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={`${match.type} search`} 
                            size="small" 
                            color={getMatchTypeColor(match.type)}
                            variant="outlined"
                          />
                          <Chip 
                            label={`Score: ${match.score}`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {highlightText(match.content, query)}
                      </Typography>

                      {match.matches && match.matches.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Matching sections:
                          </Typography>
                          {match.matches.map((m, idx) => (
                            <Box key={idx} sx={{ ml: 2, mb: 1 }}>
                              <Typography variant="caption" fontWeight="bold">
                                {m[0]}:
                              </Typography>
                              <Typography variant="body2" component="div" sx={{ ml: 1 }}>
                                {highlightText(m[1], query)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Paper>
                    {matchIndex < file.matches.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
                
                {file.total_matches > file.matches.length && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    ... and {file.total_matches - file.matches.length} more matches in this file
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default SearchResults;
