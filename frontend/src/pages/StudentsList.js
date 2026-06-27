import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api';
import StudentForm    from '../components/StudentForm';
import ConfirmDialog  from '../components/ConfirmDialog';
import Pagination     from '../components/Pagination';
import { useToast }   from '../components/Toast';

export default function StudentsList() {
  const toast = useToast();

  const [students,   setStudents]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [limit]                     = useState(10);

  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ page, limit, search: search || undefined });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, toast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounced search – reset to page 1 on new query
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editTarget) {
        await studentService.update(editTarget.id, payload);
        toast.success('Student updated successfully');
      } else {
        await studentService.create(payload);
        toast.success('Student added successfully');
      }
      setShowForm(false);
      setEditTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentService.delete(deleteTarget.id);
      toast.success('Student deleted');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const getGrade = (pct) => {
    if (pct == null) return null;
    if (pct >= 80) return <span className="grade-a">{pct}%</span>;
    if (pct >= 60) return <span className="grade-b">{pct}%</span>;
    if (pct >= 40) return <span className="grade-c">{pct}%</span>;
    return <span className="grade-f">{pct}%</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">
            {pagination ? `${pagination.total} student${pagination.total !== 1 ? 's' : ''} total` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
          + Add Student
        </button>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ maxWidth: 400 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearch}
          />
          {search && (
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
              onClick={() => { setSearch(''); setPage(1); }}>✕</button>
          )}
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: 110 }}
          value={limit}
          onChange={() => {}}
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <h3>No students found</h3>
              <p>{search ? `No results for "${search}"` : 'Add your first student to get started'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Avg %</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => {
                  const initials = (s.first_name[0] + s.last_name[0]).toUpperCase();
                  const enrolledDate = new Date(s.enrolled_at).toLocaleDateString();
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td>
                        <div className="student-name-cell">
                          <div className="avatar">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                            {s.total_subjects > 0 && (
                              <div style={{ fontSize: '.75rem', color: 'var(--gray-500)' }}>
                                {s.total_subjects} subject{s.total_subjects !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>{s.email}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{s.phone || '—'}</td>
                      <td>
                        {s.gender
                          ? <span className="badge badge-gray">{s.gender}</span>
                          : <span style={{ color: 'var(--gray-400)' }}>—</span>}
                      </td>
                      <td>{getGrade(s.average_percentage) ?? <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: '.8rem' }}>{enrolledDate}</td>
                      <td>
                        <div className="actions-cell">
                          <Link to={`/students/${s.id}`} className="btn btn-ghost btn-sm">View</Link>
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => { setEditTarget(s); setShowForm(true); }}>Edit</button>
                          <button className="btn btn-sm" style={{ background: '#fef2f2', color: 'var(--danger)', border: '1px solid #fecaca' }}
                            onClick={() => setDeleteTarget(s)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {showForm && (
        <StudentForm
          student={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.first_name} ${deleteTarget.last_name}"? This will also delete all their marks.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
