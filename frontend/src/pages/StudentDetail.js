import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService, marksService, subjectService } from '../services/api';
import StudentForm   from '../components/StudentForm';
import MarksForm     from '../components/MarksForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast }  from '../components/Toast';

function GradeLabel({ pct }) {
  if (pct == null) return <span style={{ color: 'var(--gray-400)' }}>—</span>;
  let cls = 'grade-f', label = 'F';
  if (pct >= 90) { cls = 'grade-a'; label = 'A+'; }
  else if (pct >= 80) { cls = 'grade-a'; label = 'A'; }
  else if (pct >= 70) { cls = 'grade-b'; label = 'B'; }
  else if (pct >= 60) { cls = 'grade-c'; label = 'C'; }
  return <span className={cls}>{label} ({pct}%)</span>;
}

const EXAM_BADGE = { Final: 'badge-blue', Midterm: 'badge-yellow', Quiz: 'badge-green', Assignment: 'badge-gray' };

export default function StudentDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const toast      = useToast();

  const [student,      setStudent]      = useState(null);
  const [subjects,     setSubjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [editMark,     setEditMark]     = useState(null);
  const [deleteMark,   setDeleteMark]   = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(false);

  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchStudent = useCallback(async () => {
    try {
      const res = await studentService.getById(id);
      setStudent(res.data);
    } catch (err) {
      toast.error(err.message);
      navigate('/students');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  useEffect(() => {
    subjectService.getAll().then((r) => setSubjects(r.data)).catch(console.error);
  }, []);

  const handleUpdateStudent = async (payload) => {
    setSaving(true);
    try {
      await studentService.update(id, payload);
      toast.success('Student updated');
      setShowEditForm(false);
      fetchStudent();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteStudent = async () => {
    setDeleting(true);
    try {
      await studentService.delete(id);
      toast.success('Student deleted');
      navigate('/students');
    } catch (err) { toast.error(err.message); setDeleting(false); }
  };

  const handleSaveMark = async (payload) => {
    setSaving(true);
    try {
      if (editMark) {
        await marksService.update(id, editMark.id, payload);
        toast.success('Mark updated');
      } else {
        await marksService.add(id, payload);
        toast.success('Mark added');
      }
      setShowMarkForm(false);
      setEditMark(null);
      fetchStudent();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteMark = async () => {
    setDeleting(true);
    try {
      await marksService.delete(id, deleteMark.id);
      toast.success('Mark deleted');
      setDeleteMark(null);
      fetchStudent();
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!student) return null;

  const { stats, marks } = student;
  const initials = (student.first_name[0] + student.last_name[0]).toUpperCase();
  const dob = student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '—';
  const enrolled = new Date(student.enrolled_at).toLocaleDateString();

  return (
    <div>
      {/* Back link */}
      <div style={{ marginBottom: 16 }}>
        <Link to="/students" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '.875rem' }}>
          ← Back to Students
        </Link>
      </div>

      {/* Student header card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                {student.first_name} {student.last_name}
              </h2>
              <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>{student.email}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {student.gender    && <span className="badge badge-gray">{student.gender}</span>}
                {student.phone     && <span className="badge badge-blue">📞 {student.phone}</span>}
                {student.date_of_birth && <span className="badge badge-gray">🎂 {dob}</span>}
                <span className="badge badge-gray">Enrolled {enrolled}</span>
              </div>
              {student.address && (
                <p style={{ color: 'var(--gray-500)', fontSize: '.875rem', marginTop: 8 }}>
                  📍 {student.address}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditForm(true)}>Edit</button>
              <button className="btn btn-sm" style={{ background: '#fef2f2', color: 'var(--danger)', border: '1px solid #fecaca' }}
                onClick={() => setDeleteStudent(true)}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-number">{stats.total_marks_entries}</div>
          <div className="stat-label">Mark Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.unique_subjects}</div>
          <div className="stat-label">Subjects</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ fontSize: '1.4rem' }}>
            <GradeLabel pct={stats.average_percentage} />
          </div>
          <div className="stat-label">Overall Grade</div>
        </div>
      </div>

      {/* Marks table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Marks & Results</span>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditMark(null); setShowMarkForm(true); }}>
            + Add Mark
          </button>
        </div>
        <div className="table-wrapper">
          {marks.length === 0 ? (
            <div className="empty-state">
              <h3>No marks recorded yet</h3>
              <p>Click "Add Mark" to record this student's first result</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Max</th>
                  <th>%</th>
                  <th>Grade</th>
                  <th>Exam Date</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.subject_name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>{m.subject_code}</div>
                    </td>
                    <td>
                      <span className={`badge ${EXAM_BADGE[m.exam_type] || 'badge-gray'}`}>{m.exam_type}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.marks}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{m.max_marks}</td>
                    <td style={{ fontWeight: 600 }}>{m.percentage}%</td>
                    <td><GradeLabel pct={parseFloat(m.percentage)} /></td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '.8rem' }}>
                      {m.exam_date ? new Date(m.exam_date).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '.8rem', maxWidth: 140, wordBreak: 'break-word' }}>
                      {m.remarks || '—'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => { setEditMark(m); setShowMarkForm(true); }}>Edit</button>
                        <button className="btn btn-sm" style={{ background: '#fef2f2', color: 'var(--danger)', border: '1px solid #fecaca' }}
                          onClick={() => setDeleteMark(m)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditForm && (
        <StudentForm student={student} onSave={handleUpdateStudent}
          onClose={() => setShowEditForm(false)} loading={saving} />
      )}

      {showMarkForm && (
        <MarksForm mark={editMark} subjects={subjects} onSave={handleSaveMark}
          onClose={() => { setShowMarkForm(false); setEditMark(null); }} loading={saving} />
      )}

      {deleteMark && (
        <ConfirmDialog
          message={`Delete mark for ${deleteMark.subject_name} (${deleteMark.exam_type})?`}
          onConfirm={handleDeleteMark} onCancel={() => setDeleteMark(null)} loading={deleting} />
      )}

      {deleteStudent && (
        <ConfirmDialog
          message={`Permanently delete ${student.first_name} ${student.last_name} and all their marks?`}
          onConfirm={handleDeleteStudent} onCancel={() => setDeleteStudent(false)} loading={deleting} />
      )}
    </div>
  );
}
