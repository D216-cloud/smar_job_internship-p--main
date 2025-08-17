import { useState, useEffect } from 'react';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  postingType: string;
  requirements: string;
  benefits: string;
  resumeRequired: string;
  skills: string;
  category: string;
  experienceLevel: string;
  isRemote: string;
  applicationDeadline: string;
  applicationInstructions: string;
  isUrgent: string;
  views: number;
  applications: number;
  postedBy: string;
  createdAt: string;
}

export const useUserJobs = (userId: string) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const migrateExistingJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/migrate-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Migration result:', result);
        // After migration, fetch the jobs again
        fetchUserJobs();
      }
    } catch (err) {
      console.error('Migration failed:', err);
    }
  };

  const fetchUserJobs = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/jobs/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No jobs found for this user');
        } else if (response.status === 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setJobs(data);
      
      // If no jobs found, try to migrate existing jobs
      if (data.length === 0) {
        await migrateExistingJobs();
      }
    } catch (err) {
      console.error('Error fetching user jobs:', err);
      
      // Provide more specific error messages
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please make sure the backend is running.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserJobs();
  }, [userId]);

  return { jobs, loading, error, refetch: fetchUserJobs };
}; 