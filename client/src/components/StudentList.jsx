// src/components/StudentList.jsx (Create this file)

import React from 'react';
import './StudentList.css'; // Create this for styling

function StudentList({ students, onEdit, onDelete }) {
    return (
        <div className="student-list-container">
            <h2>Student Records ({students.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Total Marks</th>
                        <th>Marks Obtained</th>
                        <th>Percentage</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student._id}>
                            <td>{student.student_id}</td>
                            <td>{student.student_name}</td>
                            <td>{student.total_marks}</td>
                            <td>{student.marks_obtained}</td>
                            <td>{student.percentage.toFixed(2)}%</td>
                            <td>
                                <button className="edit-btn" onClick={() => onEdit(student)}>Edit</button>
                                <button className="delete-btn" onClick={() => onDelete(student._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StudentList;