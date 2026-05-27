import React from 'react';

export default function SegmentedType({ name, value, onChange }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Loai giao dich">
      {[
        ['expense', 'Chi'],
        ['income', 'Thu']
      ].map(([id, label]) => (
        <label key={id}>
          <input checked={value === id} name={name} onChange={() => onChange(id)} type="radio" value={id} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}
