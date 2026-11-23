import { useState } from 'react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  options = [],
  placeholder,
  as,
  rows = 5,
  disabled,
  required,
  maxLength,
  min,
  max,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const id = `f-${name}`;
  const isPassword = type === 'password';

  const common = {
    id,
    name,
    value: value ?? '',
    onChange,
    disabled,
    placeholder,
    maxLength,
    autoComplete,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-err` : undefined,
  };

  let control;
  if (as === 'select') {
    control = (
      <select {...common}>
        <option value="">Select…</option>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea {...common} rows={rows} />;
  } else {
    control = <input {...common} type={isPassword && show ? 'text' : type} min={min} max={max} />;
  }

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="req" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <div className={isPassword ? 'pw-wrap' : undefined}>
        {control}
        {isPassword && (
          <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}>
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && !error && <small className="hint">{hint}</small>}
      {error && (
        <small className="error" id={`${id}-err`}>
          {error}
        </small>
      )}
    </div>
  );
}
