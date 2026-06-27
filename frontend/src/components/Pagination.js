export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { current_page, total_pages, total, per_page } = pagination;

  // Build page numbers with ellipsis
  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, current_page - delta);
    const right = Math.min(total_pages, current_page + delta);

    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total_pages) { if (right < total_pages - 1) pages.push('...'); pages.push(total_pages); }

    return pages;
  };

  const start = (current_page - 1) * per_page + 1;
  const end   = Math.min(current_page * per_page, total);

  return (
    <div style={{ borderTop: '1px solid var(--gray-100)' }}>
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={current_page === 1}
          onClick={() => onPageChange(current_page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination-info">…</span>
          ) : (
            <button
              key={p}
              className={`pagination-btn ${p === current_page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className="pagination-btn"
          disabled={current_page === total_pages}
          onClick={() => onPageChange(current_page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <p className="pagination-info" style={{ textAlign: 'center', paddingBottom: 12 }}>
        Showing {start}–{end} of {total} students
      </p>
    </div>
  );
}
