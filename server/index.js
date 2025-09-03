// index.js (Complete, more robust version)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Student Schema and Model ---
const studentSchema = new mongoose.Schema({
    student_id: { type: String, required: true, unique: true },
    student_name: String,
    total_marks: Number,
    marks_obtained: Number,
    percentage: Number,
    created_at: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// --- File Upload Setup ---
const upload = multer({ storage: multer.memoryStorage() });

// --- API ROUTES ---

// POST /upload - Upload and process Excel/CSV file
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log('[/upload] - Route hit. Processing uploaded file...');

    if (!req.file) {
        console.log('[/upload] - Error: No file was uploaded.');
        return res.status(400).send('No file uploaded.');
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`[/upload] - Parsed ${sheetData.length} rows from the sheet.`);

        const validStudents = sheetData.map(row => {
            const totalMarks = Number(row['Total_Marks']);
            const marksObtained = Number(row['Marks_Obtained']);
            if (!row['Student_ID'] || !row['Student_Name']) {
                return null; // Skip rows with missing critical data
            }
            return {
                student_id: String(row['Student_ID']),
                student_name: String(row['Student_Name']),
                total_marks: isNaN(totalMarks) ? 0 : totalMarks,
                marks_obtained: isNaN(marksObtained) ? 0 : marksObtained,
                percentage: (totalMarks > 0) ? (marksObtained / totalMarks) * 100 : 0
            };
        }).filter(Boolean); // Filter out any null entries

        console.log(`[/upload] - Found ${validStudents.length} valid student records for the database.`);

        if (validStudents.length === 0) {
            return res.status(400).send('No valid student data found in the file.');
        }

        const operations = validStudents.map(student => ({
            updateOne: {
                filter: { student_id: student.student_id },
                update: { $set: student },
                upsert: true
            }
        }));
        
        console.log('[/upload] - Executing database operation...');
        const result = await Student.bulkWrite(operations);
        console.log('[/upload] - Database operation successful.', result);

        const successMessage = `${result.upsertedCount} new students added, ${result.modifiedCount} existing students updated.`;
        res.status(201).send(successMessage);

    } catch (error) {
        console.error('[/upload] - A critical error occurred:', error);
        res.status(500).send('An error occurred on the server while processing the file.');
    }
});

// GET /students - Fetch all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ created_at: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).send('Error fetching students.');
    }
});

// PUT /students/:id - Update a student record
app.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { student_name, marks_obtained, total_marks } = req.body;
        const percentage = (marks_obtained / total_marks) * 100;
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { student_name, marks_obtained, total_marks, percentage },
            { new: true }
        );
        if (!updatedStudent) return res.status(404).send('Student not found.');
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).send('Error updating student.');
    }
});

// DELETE /students/:id - Delete a student record
app.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) return res.status(404).send('Student not found.');
        res.status(200).send('Student deleted successfully.');
    } catch (error) {
        res.status(500).send('Error deleting student.');
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
