import React from 'react';

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-2">
      <h1 className="font-display text-3xl font-bold text-text-1">{title}</h1>
      {subtitle && <p className="text-text-2 mt-1.5">{subtitle}</p>}
    </div>
  );
}
