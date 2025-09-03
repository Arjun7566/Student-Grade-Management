// src/components/FileUpload.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const API_URL = 'https://student-grade-management-backend.onrender.com';

function FileUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(response.data);
            onUploadSuccess();
        } catch (err) {
            console.error('Upload failed:', err);
            if (err.response) {
                // Server responded with an error status (e.g., 400, 500)
                setError(err.response.data || 'Server responded with an error.');
            } else if (err.request) {
                // Request was made but no response was received (server might be down)
                setError('Upload failed. No response from the server. Is it running?');
            } else {
                // Something else went wrong
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setUploading(false);
            document.getElementById('file-input').value = '';
            setFile(null);
        }
    };

    return (
        <div className="file-upload-container">
            <h2>Upload Student Grades</h2>
            <p>Select an Excel (.xlsx) or CSV (.csv) file to upload.</p>
            <div className="upload-controls">
                <input
                    id="file-input"
                    type="file"
                    accept=".xlsx, .csv"
                    onChange={handleFileChange}
                />
                <button onClick={handleUpload} disabled={!file || uploading}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default FileUpload;
