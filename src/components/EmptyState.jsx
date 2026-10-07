import React from 'react';
import Icon from './Icon.jsx';

export default function EmptyState({ icon = 'activity', title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={24} /></div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
