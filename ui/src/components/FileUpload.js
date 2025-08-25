import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['txt', 'pdf', 'csv', 'json'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      setMessage('Please upload TXT, PDF, CSV, or JSON files only.');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://mini-search-engine-17k8.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ "${data.filename}" uploaded successfully! Created ${data.chunks_created} searchable chunks.`);
        setMessageType('success');
        onUploadSuccess();
      } else {
        const errorData = await response.json();
        setMessage(`❌ Upload failed: ${errorData.detail}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`❌ Upload error: ${error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📁 Upload Knowledge Base Files
      </Typography>

      <Box sx={{ mb: 2 }}>
        {['TXT', 'PDF', 'CSV', 'JSON'].map((type) => (
          <Chip key={type} label={type} size="small" sx={{ mr: 1 }} />
        ))}
      </Box>

      <input
        accept=".txt,.pdf,.csv,.json"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
      />

      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </label>

      {message && (
        <Alert severity={messageType} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
