import React from 'react';

export default function StatusBadge({ status = 'UNKNOWN' }) {
  const normalized = String(status).toLowerCase();
  return <span className={`status-badge status-${normalized}`}>{status}</span>;
}
