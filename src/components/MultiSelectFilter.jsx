import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

function toValues(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function MultiSelectFilter({
  label,
  icon: Icon,
  options = [],
  value,
  onChange,
  placeholder,
  example,
  sanitize = (text) => text.replace(/\d/g, ''),
  validationMessage = 'Цифры вводить нельзя',
  emptyText = 'Вариантов пока нет',
}) {
  const externalText = toValues(value).join(', ');
  const [text, setText] = useState(externalText);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);
  const selected = toValues(value);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const commit = (nextText) => {
    const sanitized = sanitize(nextText);
    setText(sanitized);
    setError(sanitized === nextText ? '' : validationMessage);
    onChange(toValues(sanitized));
  };

  const toggleOption = (option) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(next);
    setText(next.join(', '));
    setError('');
  };

  const clear = () => {
    onChange([]);
    setText('');
    setError('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
        <span>{label}</span>
        {Icon && <Icon size={14} className="text-slate-400" />}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={focused ? text : externalText}
          onFocus={() => {
            setFocused(true);
            setText(externalText);
            setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            setText(externalText);
          }}
          onChange={(event) => commit(event.target.value)}
          className={`w-full bg-[#f1f5f9] border rounded-xl px-3 py-2 pr-8 text-xs outline-none transition focus:bg-white ${
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-transparent focus:border-[#025a94]'
          }`}
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={`Открыть список: ${label}`}
          aria-expanded={open}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#025a94] transition cursor-pointer"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {example && !error && (
        <p className="mt-1 text-[10px] text-slate-400 leading-snug">
          Через запятую. Например: {example}
        </p>
      )}
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Выберите несколько
            </span>
            <button
              type="button"
              onClick={clear}
              className="text-[10px] text-slate-400 hover:text-[#025a94] transition flex items-center gap-1 cursor-pointer"
            >
              <X size={11} />
              Очистить
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto p-1.5">
            {options.length === 0 ? (
              <p className="px-2 py-2 text-[11px] text-slate-400">{emptyText}</p>
            ) : (
              options.map((option) => {
                const active = selected.includes(option);
                return (
                  <label
                    key={option}
                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer transition ${
                      active
                        ? 'bg-[#e6f2fb] text-[#025a94] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                        active
                          ? 'bg-[#025a94] border-[#025a94] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {active && <Check size={10} strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleOption(option)}
                      className="sr-only"
                    />
                    <span className="leading-snug">{option}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
