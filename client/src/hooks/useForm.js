import { useState } from 'react';

export default function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => (er[name] ? { ...er, [name]: '' } : er));
  };

  const setField = (name, value) => handleChange({ target: { name, value } });
  const reset = (next = initial) => {
    setValues(next);
    setErrors({});
  };

  return { values, errors, setValues, setErrors, handleChange, setField, reset };
}
