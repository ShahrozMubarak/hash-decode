export default function Loading() {
  return (
    <div className="wrap interior page-loading-wrap" role="status" aria-label="Loading page content">
      <div className="skeleton-intro">
        <div className="skeleton-bar skeleton-eyebrow" aria-hidden="true" />
        <div className="skeleton-bar skeleton-title" aria-hidden="true" />
        <div className="skeleton-bar skeleton-lead" aria-hidden="true" />
      </div>

      <div className="skeleton-grid" aria-hidden="true">
        <div className="skeleton-card">
          <div className="skeleton-bar skeleton-card-badge" />
          <div className="skeleton-bar skeleton-card-title" />
          <div className="skeleton-bar skeleton-card-text" />
          <div className="skeleton-bar skeleton-card-text short" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-bar skeleton-card-badge" />
          <div className="skeleton-bar skeleton-card-title" />
          <div className="skeleton-bar skeleton-card-text" />
          <div className="skeleton-bar skeleton-card-text short" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-bar skeleton-card-badge" />
          <div className="skeleton-bar skeleton-card-title" />
          <div className="skeleton-bar skeleton-card-text" />
          <div className="skeleton-bar skeleton-card-text short" />
        </div>
      </div>
      <span className="sr-only">Loading page content...</span>
    </div>
  );
}
