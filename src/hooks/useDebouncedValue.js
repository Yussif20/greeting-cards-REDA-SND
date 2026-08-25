import { useEffect, useState } from "react";

/** Replaces the single lodash.debounce the old editor pulled the library in for. */
export function useDebouncedValue(value, delay = 80) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
