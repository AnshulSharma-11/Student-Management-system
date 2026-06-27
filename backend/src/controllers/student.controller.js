const { pool } = require('../config/db');

// ──────────────────────────────────────────────────────────────────
//  GET /students?page=1&limit=10&search=john
// ──────────────────────────────────────────────────────────────────
async function getAllStudents(req, res, next) {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit) || 10, 100);
    const search = (req.query.search || '').trim();
    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause for optional search
    let whereClause = '';
    const params    = [];

    if (search) {
      whereClause = `
        WHERE s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?`;
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    // Count total matching records (for pagination metadata)
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM students s ${whereClause}`,
      params,
    );
    const total      = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Fetch paginated students with computed average
    const [students] = await pool.query(
      `SELECT
          s.id,
          s.first_name,
          s.last_name,
          s.email,
          s.phone,
          s.date_of_birth,
          s.gender,
          s.address,
          s.enrolled_at,
          COUNT(m.id)                                        AS total_subjects,
          IFNULL(ROUND(AVG(m.marks / m.max_marks * 100), 2), NULL) AS average_percentage
       FROM students s
       LEFT JOIN marks m ON m.student_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY s.enrolled_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        current_page: page,
        per_page:     limit,
        total_pages:  totalPages,
        has_next:     page < totalPages,
        has_prev:     page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  GET /students/:id  (includes all marks)
// ──────────────────────────────────────────────────────────────────
async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    // Student row
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone,
              date_of_birth, gender, address, enrolled_at, updated_at
       FROM students WHERE id = ?`,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = rows[0];

    // Associated marks with subject info
    const [marks] = await pool.query(
      `SELECT m.id, m.exam_type, m.marks, m.max_marks, m.exam_date, m.remarks,
              m.created_at,
              sub.id AS subject_id, sub.name AS subject_name, sub.code AS subject_code,
              ROUND(m.marks / m.max_marks * 100, 2) AS percentage
       FROM marks m
       JOIN subjects sub ON sub.id = m.subject_id
       WHERE m.student_id = ?
       ORDER BY sub.name, m.exam_type`,
      [id],
    );

    // Aggregate stats
    const totalSubjects = new Set(marks.map((m) => m.subject_id)).size;
    const avgPct = marks.length
      ? +(marks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / marks.length).toFixed(2)
      : null;

    res.json({
      success: true,
      data: {
        ...student,
        marks,
        stats: { total_marks_entries: marks.length, unique_subjects: totalSubjects, average_percentage: avgPct },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  POST /students
// ──────────────────────────────────────────────────────────────────
async function createStudent(req, res, next) {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address } = req.body;

    const [result] = await pool.query(
      `INSERT INTO students (first_name, last_name, email, phone, date_of_birth, gender, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || null, date_of_birth || null, gender || null, address || null],
    );

    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Student created successfully', data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  PUT /students/:id
// ──────────────────────────────────────────────────────────────────
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;

    // Check existence
    const [existing] = await pool.query('SELECT id FROM students WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Build dynamic SET clause from provided fields only
    const allowed = ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender', 'address'];
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

    values.push(id);
    await pool.query(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    res.json({ success: true, message: 'Student updated successfully', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

// ──────────────────────────────────────────────────────────────────
//  DELETE /students/:id
// ──────────────────────────────────────────────────────────────────
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, first_name, last_name FROM students WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Marks are cascade-deleted by FK constraint
    await pool.query('DELETE FROM students WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Student "${existing[0].first_name} ${existing[0].last_name}" deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };
