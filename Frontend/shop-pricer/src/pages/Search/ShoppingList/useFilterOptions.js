import { useEffect, useState } from "react";

const API_BASE_URL = 'http://localhost:8080/api';

export default function useFilterOptions(categoryId, brands) {
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    if (!categoryId || !brands || brands.length === 0) return;

    const brandSelections = brands
      .filter(b => b.state !== 'neutral')
      .map(b => ({ brandId: b.id, state: b.state }));

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/filter-options`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId, brandSelections }),
        });
        const data = await res.json();
        if (!cancelled) setMeasurements([...new Set(data)]);
      } catch {
        if (!cancelled) setMeasurements([]);
      }
    })();

    return () => { cancelled = true; };
  }, [categoryId, brands]);

  return measurements;
}
