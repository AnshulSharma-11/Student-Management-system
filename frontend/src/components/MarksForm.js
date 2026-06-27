import { useState, useEffect } from 'react';

const EMPTY = { subject_id: '', marks: '', max_marks: '100', exam_type: 'Final', exam_date: '', remarks: '' };

function validate(f) {
  const errs = {};
  if (!f.subject_id)                          errs.subject_id = 'Subject is required';
  if (f.marks === '')                          errs.marks = 'Marks are required';
  else if (isNaN(f.marks) || +f.marks < 0 || +f.marks > +f.max_marks) errs.marks = `Marks must be 0–${f.max_marks}`;
  if (!f.max_marks || isNaN(f.max_marks) || +f.max_marks <= 0) errs.max_marks = 'Max marks must be > 0';
  return errs;
}

export default function MarksForm({ mark, subjects, onSave, onClose, loading }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mark) {
      setFields({
        subject_id: mark.subject_id  || '',
        marks:      mark.marks       ?? '',
        max_marks:  mark.max_marks   || '100',
        exam_type:  mark.exam_type   || 'Final',
        exam_date:  mark.exam_date ? mark.exam_date.slice(0, 10) : '',
        remarks:    mark.remarks     || '',
      });
    } else {
      setFields(EMPTY);
    }
    setErrors({});
  }, [mark]);

  const set = (field, val) => {
    setFields((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      subject_id: +fields.subject_id,
      marks:      +fields.marks,
      max_marks:  +fields.max_marks,
      exam_type:  fields.exam_type,
      exam_date:  fields.exam_date || undefined,
      remarks:    fields.remarks   || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{mark ? 'Edit Mark' : 'Add Mark'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className={`form-control${errors.subject_id ? ' is-invalid' : ''}`}
              value={fields.subject_id}
              onChange={(e) => set('subject_id', e.target.value)}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
            {errors.subject_id && <p className="form-error">{errors.subject_id}</p>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Marks *</label>
              <input className={`form-control${errors.marks ? ' is-invalid' : ''}`}
                type="number" min="0" max={fields.max_marks} step="0.5"
                value={fields.marks} onChange={(e) => set('marks', e.target.value)} />
              {errors.marks && <p className="form-error">{errors.marks}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks *</label>
              <input className={`form-control${errors.max_marks ? ' is-invalid' : ''}`}
                type="number" min="1" step="0.5"
                value={fields.max_marks} onChange={(e) => set('max_marks', e.target.value)} />
              {errors.max_marks && <p className="form-error">{errors.max_marks}</p>}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Exam Type</label>
              <select className="form-control" value={fields.exam_type} onChange={(e) => set('exam_type', e.target.value)}>
                {['Midterm', 'Final', 'Quiz', 'Assignment'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input className="form-control" type="date" value={fields.exam_date} onChange={(e) => set('exam_date', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <input className="form-control" type="text" value={fields.remarks}
              placeholder="Optional remarks" onChange={(e) => set('remarks', e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : mark ? 'Update Mark' : 'Add Mark'}
          </button>
        </div>
      </div>
    </div>
  );
}
