
import { useState, useCallback } from 'react';

export const useSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);

  // Fetch jobs and internships from backend
  const fetchItems = useCallback(async () => {
    try {
      const [jobsRes, internshipsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/internships')
      ]);
      
      if (jobsRes.ok && internshipsRes.ok) {
        const jobs = await jobsRes.json();
        const internships = await internshipsRes.json();
        setAllItems([
          ...jobs.map(j => ({ ...j, type: 'job' })),
          ...internships.map(i => ({ ...i, type: 'internship' }))
        ]);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('API not available, using sample data:', error);
      
      // Fallback sample data for deployment demo
      const sampleJobs = [
        {
          _id: 'demo-job-1',
          id: 'demo-job-1',
          title: 'Frontend Developer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          salary: '$80,000 - $120,000',
          type: 'Full-time',
          description: 'We are looking for a skilled Frontend Developer...',
          requirements: ['React', 'TypeScript', 'CSS'],
          postedDate: new Date().toISOString(),
          postedBy: 'tech-corp'
        },
        {
          _id: 'demo-job-2', 
          id: 'demo-job-2',
          title: 'Backend Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          salary: '$70,000 - $100,000',
          type: 'Full-time',
          description: 'Join our backend team...',
          requirements: ['Node.js', 'MongoDB', 'Express'],
          postedDate: new Date().toISOString(),
          postedBy: 'startup-xyz'
        }
      ];

      const sampleInternships = [
        {
          _id: 'demo-int-1',
          id: 'demo-int-1',
          title: 'Software Engineering Intern',
          company: 'Innovation Labs',
          location: 'New York, NY',
          salary: '$3,000/month',
          type: 'Internship',
          description: 'Join our summer internship program...',
          requirements: ['Programming basics', 'CS student', 'Eager to learn'],
          postedDate: new Date().toISOString(),
          postedBy: 'innovation-labs'
        },
        {
          _id: 'demo-int-2',
          id: 'demo-int-2', 
          title: 'UI/UX Design Intern',
          company: 'Creative Studio',
          location: 'Remote',
          salary: '$2,500/month',
          type: 'Internship',
          description: 'Work with our design team...',
          requirements: ['Design tools', 'Portfolio', 'Creative mindset'],
          postedDate: new Date().toISOString(),
          postedBy: 'creative-studio'
        }
      ];
      
      setAllItems([
        ...sampleJobs.map(j => ({ ...j, type: 'job' })),
        ...sampleInternships.map(i => ({ ...i, type: 'internship' }))
      ]);
    }
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
