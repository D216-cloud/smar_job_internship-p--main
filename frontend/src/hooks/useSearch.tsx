
import { useState, useCallback } from 'react';

export const useSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);

  // Fetch jobs and internships from backend
  const fetchItems = useCallback(async () => {
    const [jobsRes, internshipsRes] = await Promise.all([
      fetch('http://localhost:5000/api/jobs'),
      fetch('http://localhost:5000/api/internships')
    ]);
    const jobs = await jobsRes.json();
    const internships = await internshipsRes.json();
    setAllItems([
      ...jobs.map(j => ({ ...j, type: 'job' })),
      ...internships.map(i => ({ ...i, type: 'internship' }))
    ]);
  }, []);

  const searchResults = useCallback(async (query) => {
    setIsLoading(true);
    if (allItems.length === 0) {
      await fetchItems();
    }
    const q = query.toLowerCase();
    const results = allItems.filter(item =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.company && item.company.toLowerCase().includes(q))
    );
    setIsLoading(false);
    return results;
  }, [allItems, fetchItems]);

  return { searchResults, isLoading };
};
