import React from 'react';
import {
  Box,
  Typography,
  Chip
} from '@mui/material';

const SearchHistory = ({ history, onHistoryClick }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Recent Searches:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {history.map((query, index) => (
          <Chip
            key={index}
            label={query}
            variant="outlined"
            size="small"
            onClick={() => onHistoryClick(query)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SearchHistory;
