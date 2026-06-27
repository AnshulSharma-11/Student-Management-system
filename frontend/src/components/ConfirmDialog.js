export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--danger)' }}>⚠ Confirm Delete</h2>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
