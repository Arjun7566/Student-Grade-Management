// src/components/EditModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditModal.css'; // Create this CSS file for basic styling

function EditModal({ student, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...student });

    useEffect(() => {
        setFormData({ ...student });
    }, [student]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://student-grade-management-npa9.onrender.com/students/${student._id}`, formData);
            onSave(); // This will trigger a refresh and close the modal
        } catch (error) {
            console.error("Failed to update student", error);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Edit Student</h2>
                <form onSubmit={handleSubmit}>
                    <label>Student Name:</label>
                    <input
                        type="text"
                        name="student_name"
                        value={formData.student_name}
                        onChange={handleChange}
                    />
                    <label>Marks Obtained:</label>
                    <input
                        type="number"
                        name="marks_obtained"
                        value={formData.marks_obtained}
                        onChange={handleChange}
                    />
                    <label>Total Marks:</label>
                    <input
                        type="number"
                        name="total_marks"
                        value={formData.total_marks}
                        onChange={handleChange}
                    />
                    <div className="modal-actions">
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditModal;
