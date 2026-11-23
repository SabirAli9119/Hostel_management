import { useState } from 'react';
import useDebounce from './useDebounce.js';

// Holds search / filter / page state for list screens.
export default function useListQuery(initial = {}) {
  const base = { search: '', page: 1, limit: 10, ...initial };
  const [params, setParams] = useState(base);
  const debouncedSearch = useDebounce(params.search, 350);

  const setParam = (key, value) => setParams((p) => ({ ...p, [key]: value, page: 1 }));
  const setPage = (page) => setParams((p) => ({ ...p, page }));
  const reset = () => setParams(base);

  const query = Object.fromEntries(
    Object.entries({ ...params, search: debouncedSearch }).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined
    )
  );

  return { params, setParam, setPage, reset, query, queryKey: JSON.stringify(query) };
}
