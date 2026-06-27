import { useState, useEffect } from 'react';

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '' };

function validate(fields) {
  const errs = {};
  if (!fields.first_name.trim())  errs.first_name  = 'First name is required';
  if (!fields.last_name.trim())   errs.last_name   = 'Last name is required';
  if (!fields.email.trim())       errs.email       = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Invalid email format';
  if (fields.phone && !/^[+\d\s\-()]{7,20}$/.test(fields.phone)) errs.phone = 'Invalid phone number';
  return errs;
}

export default function StudentForm({ student, onSave, onClose, loading }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFields({
        first_name:    student.first_name    || '',
        last_name:     student.last_name     || '',
        email:         student.email         || '',
        phone:         student.phone         || '',
        date_of_birth: student.date_of_birth ? student.date_of_birth.slice(0, 10) : '',
        gender:        student.gender        || '',
        address:       student.address       || '',
      });
    } else {
      setFields(EMPTY);
    }
    setErrors({});
  }, [student]);

  const set = (field, val) => {
    setFields((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...fields };
    if (!payload.phone)         delete payload.phone;
    if (!payload.date_of_birth) delete payload.date_of_birth;
    if (!payload.gender)        delete payload.gender;
    if (!payload.address)       delete payload.address;
    onSave(payload);
  };

  const F = ({ label, name, type = 'text', required, children }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      {children || (
        <input
          className={`form-control${errors[name] ? ' is-invalid' : ''}`}
          type={type}
          value={fields[name]}
          onChange={(e) => set(name, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
      {errors[name] && <p className="form-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <F label="First Name" name="first_name" required />
            <F label="Last Name"  name="last_name"  required />
          </div>

          <F label="Email Address" name="email" type="email" required />

          <div className="form-grid">
            <F label="Phone" name="phone" />
            <F label="Date of Birth" name="date_of_birth" type="date" />
          </div>

          <F label="Gender" name="gender">
            <select
              className={`form-control${errors.gender ? ' is-invalid' : ''}`}
              value={fields.gender}
              onChange={(e) => set('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </F>

          <F label="Address" name="address">
            <textarea
              className={`form-control${errors.address ? ' is-invalid' : ''}`}
              value={fields.address}
              onChange={(e) => set('address', e.target.value)}
              rows={2}
              placeholder="Enter address (optional)"
            />
          </F>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : student ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
