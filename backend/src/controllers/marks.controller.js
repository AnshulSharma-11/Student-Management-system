const { pool } = require('../config/db');

// ──────────────────────────────────────────────────────────────────
//  GET /students/:studentId/marks
// ──────────────────────────────────────────────────────────────────
async function getMarksByStudent(req, res, next) {
  try {
    const { studentId } = req.params;

    const [student] = await pool.query('SELECT id, first_name, last_name FROM students WHERE id = ?', [studentId]);
    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const [marks] = await pool.query(
      `SELECT m.id, m.exam_type, m.marks, m.max_marks, m.exam_date, m.remarks,
              ROUND(m.marks / m.max_marks * 100, 2) AS percentage,
              sub.id AS subject_id, sub.name AS subject_name, sub.code AS subject_code,
              m.created_at, m.updated_at
       FROM marks m
       JOIN subjects sub ON sub.id = m.subject_id
       WHERE m.student_id = ?
       ORDER BY sub.name, m.exam_type`,
      [studentId],
    );

    res.json({ success: true, data: { student: student[0], marks } });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  POST /students/:studentId/marks
// ──────────────────────────────────────────────────────────────────
async function addMark(req, res, next) {
  try {
    const { studentId } = req.params;
    const { subject_id, marks, max_marks = 100, exam_type = 'Final', exam_date, remarks } = req.body;

    // Verify student exists
    const [student] = await pool.query('SELECT id FROM students WHERE id = ?', [studentId]);
    if (!student.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Verify subject exists
    const [subject] = await pool.query('SELECT id FROM subjects WHERE id = ?', [subject_id]);
    if (!subject.length) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const [result] = await pool.query(
      `INSERT INTO marks (student_id, subject_id, marks, max_marks, exam_type, exam_date, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, subject_id, marks, max_marks, exam_type, exam_date || null, remarks || null],
    );

    const [newMark] = await pool.query(
      `SELECT m.*, sub.name AS subject_name, sub.code AS subject_code,
              ROUND(m.marks / m.max_marks * 100, 2) AS percentage
       FROM marks m JOIN subjects sub ON sub.id = m.subject_id
       WHERE m.id = ?`,
      [result.insertId],
    );

    res.status(201).json({ success: true, message: 'Mark added successfully', data: newMark[0] });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  PUT /students/:studentId/marks/:markId
// ──────────────────────────────────────────────────────────────────
async function updateMark(req, res, next) {
  try {
    const { studentId, markId } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM marks WHERE id = ? AND student_id = ?',
      [markId, studentId],
    );
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Mark record not found' });
    }

    const allowed = ['subject_id', 'marks', 'max_marks', 'exam_type', 'exam_date', 'remarks'];
    const fields  = [];
    const values  = [];

    allowed.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        fields.push(`${field} = ?`);
        values.push(req.body[field] ?? null);
      }
    });

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    values.push(markId, studentId);
    await pool.query(`UPDATE marks SET ${fields.join(', ')} WHERE id = ? AND student_id = ?`, values);

    const [updated] = await pool.query(
      `SELECT m.*, sub.name AS subject_name, sub.code AS subject_code,
              ROUND(m.marks / m.max_marks * 100, 2) AS percentage
       FROM marks m JOIN subjects sub ON sub.id = m.subject_id
       WHERE m.id = ?`,
      [markId],
    );

    res.json({ success: true, message: 'Mark updated successfully', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  DELETE /students/:studentId/marks/:markId
// ──────────────────────────────────────────────────────────────────
async function deleteMark(req, res, next) {
  try {
    const { studentId, markId } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM marks WHERE id = ? AND student_id = ?',
      [markId, studentId],
    );
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Mark record not found' });
    }

    await pool.query('DELETE FROM marks WHERE id = ?', [markId]);
    res.json({ success: true, message: 'Mark deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  GET /subjects  (helper – lets frontend populate dropdowns)
// ──────────────────────────────────────────────────────────────────
async function getAllSubjects(req, res, next) {
  try {
    const [subjects] = await pool.query('SELECT id, name, code FROM subjects ORDER BY name');
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMarksByStudent, addMark, updateMark, deleteMark, getAllSubjects };
