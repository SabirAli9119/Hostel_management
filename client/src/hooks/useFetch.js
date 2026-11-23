import { useEffect, useState } from 'react';
import { errMsg } from '../utils/format.js';

// fetcher must return an axios promise. `data` is the response body.
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher()
      .then((res) => alive && setState({ data: res.data, loading: false, error: '' }))
      .catch((err) => alive && setState({ data: null, loading: false, error: errMsg(err) }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
