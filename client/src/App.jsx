// src/App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import StudentList from './components/StudentList';
import EditModal from './components/EditModal';
import './App.css';

// Define the base URL for your backend API
const API_URL = 'https://student-grade-management-npa9.onrender.com';

function App() {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all students from the backend
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/students`);
            setStudents(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch student data. Is the server running?');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // --- Event Handlers for Edit Modal ---
    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSave = () => {
        fetchStudents(); // Refresh student list after saving changes
        handleCloseModal();
    };

    // --- Event Handler for Deleting a Student ---
    const handleDelete = async (id) => {
        if (!id) {
            console.error("Delete failed: Student ID is missing!");
            return;
        }

        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`${API_URL}/students/${id}`);
                fetchStudents(); // Refresh student list after deleting
            } catch (error) {
                console.error('Failed to delete student', error);
                alert('An error occurred while deleting the student.');
            }
        }
    };

    return (
        <div className="App">
            <h1>Student Grade Management</h1>
            <FileUpload onUploadSuccess={fetchStudents} />

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && (
                <StudentList
                    students={students}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {isModalOpen && (
                <EditModal
                    student={editingStudent}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default App;
