export default function PageLoading() {
  return (
    <div className="page-loading" role="status" aria-live="polite" aria-label="Loading page">
      <div className="page-loading-heading">
        <span className="page-loading-line page-loading-title" />
        <span className="page-loading-line page-loading-copy" />
      </div>
      <div className="page-loading-grid">
        <span className="page-loading-card" />
        <span className="page-loading-card" />
        <span className="page-loading-card" />
      </div>
    </div>
  );
}