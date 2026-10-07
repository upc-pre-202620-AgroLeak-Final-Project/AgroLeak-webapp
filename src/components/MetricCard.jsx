import React from 'react';
import Icon from './Icon.jsx';

export default function MetricCard({ icon, label, value, helper, tone = 'green' }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon tone-${tone}`}><Icon name={icon} size={21} /></div>
      <div className="metric-copy">
        <span className="metric-label">{label}</span>
        <strong className="metric-value">{value}</strong>
        <span className="metric-helper">{helper}</span>
      </div>
    </article>
  );
}
