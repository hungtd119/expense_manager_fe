import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * AppSelect – A polished custom select component replacing native <select>
 *
 * Props:
 *  - options: [{ value, label, icon?, color? }]
 *  - value: current value (string)
 *  - onChange: (value: string) => void
 *  - placeholder?: string   (shown when no value selected)
 *  - searchable?: boolean   (default: true when options > 5)
 *  - clearable?: boolean    (show × button to reset)
 *  - required?: boolean
 *  - disabled?: boolean
 *  - id?: string
 */
export default function AppSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn...',
  searchable,
  clearable = false,
  required = false,
  disabled = false,
  id
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const isSearchable = searchable !== undefined ? searchable : options.length > 5;

  const selected = options.find((o) => String(o.value) === String(value)) || null;

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search when opens
  useEffect(() => {
    if (open && isSearchable && searchRef.current) {
      searchRef.current.focus();
    }
    if (open && listRef.current) {
      // scroll selected item into view
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [open, isSearchable]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      const items = filtered;
      const currentIdx = items.findIndex((o) => String(o.value) === String(value));
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        containerRef.current?.querySelector('[data-trigger]')?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[Math.min(currentIdx + 1, items.length - 1)];
        if (next) onChange(String(next.value));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[Math.max(currentIdx - 1, 0)];
        if (prev) onChange(String(prev.value));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setOpen(false);
        setQuery('');
      }
    },
    [open, filtered, value, onChange]
  );

  function select(optVal) {
    onChange(String(optVal));
    setOpen(false);
    setQuery('');
  }

  function toggle() {
    if (disabled) return;
    setOpen((prev) => !prev);
    if (open) setQuery('');
  }

  function clear(e) {
    e.stopPropagation();
    onChange('');
  }

  return (
    <div
      className={`app-select${open ? ' app-select--open' : ''}${disabled ? ' app-select--disabled' : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native input for form required validation */}
      {required && (
        <input
          aria-hidden="true"
          required
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          tabIndex={-1}
          value={value || ''}
          onChange={() => {}}
        />
      )}

      {/* Trigger button */}
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="app-select__trigger"
        data-trigger
        disabled={disabled}
        id={id}
        onClick={toggle}
        type="button"
      >
        <span className="app-select__value">
          {selected ? (
            <span className="app-select__selected-text">{selected.label}</span>
          ) : (
            <span className="app-select__placeholder">{placeholder}</span>
          )}
        </span>
        <span className="app-select__controls">
          {clearable && selected && (
            <span
              aria-label="Xóa"
              className="app-select__clear"
              onClick={clear}
              role="button"
              tabIndex={-1}
            >
              ✕
            </span>
          )}
          <span className={`app-select__chevron${open ? ' app-select__chevron--up' : ''}`}>
            <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </span>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="app-select__menu" role="listbox">
          {isSearchable && (
            <div className="app-select__search-wrap">
              <svg className="app-select__search-icon" fill="none" height="14" viewBox="0 0 16 16" width="14">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
              </svg>
              <input
                className="app-select__search"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                ref={searchRef}
                type="text"
                value={query}
              />
            </div>
          )}
          <ul className="app-select__list" ref={listRef}>
            {filtered.length === 0 ? (
              <li className="app-select__empty">Không tìm thấy</li>
            ) : (
              filtered.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <li
                    className={`app-select__item${isSelected ? ' app-select__item--selected' : ''}`}
                    data-selected={isSelected}
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {opt.icon && (
                      <span
                        className="app-select__icon"
                        style={opt.color ? { background: opt.color } : undefined}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="app-select__check">
                        <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                          <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
