import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getAll({ page: 1, limit: 5 }).then((res) => {
      setStats(res.pagination);
      setRecentStudents(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getGrade = (pct) => {
    if (pct === null || pct === undefined) return { label: 'N/A', cls: 'grade-f' };
    if (pct >= 90) return { label: 'A+', cls: 'grade-a' };
    if (pct >= 80) return { label: 'A',  cls: 'grade-a' };
    if (pct >= 70) return { label: 'B',  cls: 'grade-b' };
    if (pct >= 60) return { label: 'C',  cls: 'grade-c' };
    return { label: 'F', cls: 'grade-f' };
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your student management system</p>
        </div>
        <Link to="/students" className="btn btn-primary">
          + Add Student
        </Link>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-number">{stats?.total ?? 0}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card" style={{ '--primary': '#10b981' }}>
          <div className="stat-number" style={{ color: '#10b981' }}>
            {recentStudents.filter((s) => s.total_subjects > 0).length}
          </div>
          <div className="stat-label">With Marks</div>
        </div>
        <div className="stat-card" style={{ '--primary': '#f59e0b' }}>
          <div className="stat-number" style={{ color: '#f59e0b' }}>
            {recentStudents.filter((s) => s.average_percentage >= 70).length}
          </div>
          <div className="stat-label">Passing (≥70%)</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.total_pages ?? 0}</div>
          <div className="stat-label">Pages of Records</div>
        </div>
      </div>

      {/* Recent students table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Students</span>
          <Link to="/students" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Subjects</th>
                <th>Avg %</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
                  No students yet. <Link to="/students" style={{ color: 'var(--primary)' }}>Add one</Link>
                </td></tr>
              ) : recentStudents.map((s) => {
                const initials = (s.first_name[0] + s.last_name[0]).toUpperCase();
                const grade = getGrade(s.average_percentage);
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="avatar">{initials}</div>
                        <strong>{s.first_name} {s.last_name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{s.email}</td>
                    <td><span className="badge badge-blue">{s.total_subjects || 0}</span></td>
                    <td>{s.average_percentage != null ? `${s.average_percentage}%` : '—'}</td>
                    <td><span className={grade.cls}>{grade.label}</span></td>
                    <td>
                      <Link to={`/students/${s.id}`} className="btn btn-ghost btn-sm">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* API reference box */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span className="card-title">📡 API Endpoints Reference</span></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
            {[
              ['GET',    '/api/students?page=1&limit=10', 'Paginated student list'],
              ['POST',   '/api/students',                 'Create student'],
              ['GET',    '/api/students/:id',             'Student + marks'],
              ['PUT',    '/api/students/:id',             'Update student'],
              ['DELETE', '/api/students/:id',             'Delete student'],
              ['GET',    '/api/students/:id/marks',       'Get student marks'],
              ['POST',   '/api/students/:id/marks',       'Add mark'],
              ['PUT',    '/api/students/:id/marks/:mid',  'Update mark'],
              ['DELETE', '/api/students/:id/marks/:mid',  'Delete mark'],
              ['GET',    '/api/subjects',                 'List all subjects'],
            ].map(([method, path, desc]) => (
              <div key={path} style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '8px 10px', fontSize: '.8rem' }}>
                <span className={`badge ${method === 'GET' ? 'badge-blue' : method === 'POST' ? 'badge-green' : method === 'DELETE' ? 'badge-red' : 'badge-yellow'}`} style={{ marginRight: 6 }}>{method}</span>
                <code style={{ fontSize: '.75rem' }}>{path}</code>
                <div style={{ color: 'var(--gray-500)', marginTop: 2 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
