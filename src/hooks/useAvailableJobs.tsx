import { useState, useEffect } from 'react';
import { getAllJobs, getAllInternships } from '@/data/jobsData';

interface Job {
  _id?: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  postingType?: string;
  requirements?: string;
  benefits?: string;
  resumeRequired?: string;
  skills?: string | string[];
  category?: string;
  experienceLevel?: string;
  isRemote?: boolean | string;
  applicationDeadline?: string;
  applicationInstructions?: string;
  isUrgent?: boolean | string;
  views?: number;
  applications?: number;
  postedBy?: string;
  createdAt?: string;
  logo?: string;
}

export const useAvailableJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internships, setInternships] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from backend first
      const [jobsResponse, internshipsResponse] = await Promise.all([
        fetch('/api/jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch('/api/internships', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ]);
      
      if (jobsResponse.ok && internshipsResponse.ok) {
        const jobsData = await jobsResponse.json();
        const internshipsData = await internshipsResponse.json();
        
        // Filter jobs and internships based on postingType
        const actualJobs = jobsData.filter((job: Job) => job.postingType === 'job' || !job.postingType);
        const actualInternships = internshipsData.filter((internship: Job) => internship.postingType === 'internship');
        
        setJobs(actualJobs);
        setInternships(actualInternships);
      } else {
        console.log('Backend not available, using local data');
        // Fallback to local data
        const localJobs = getAllJobs();
        const localInternships = getAllInternships();
        
        setJobs(localJobs);
        setInternships(localInternships);
      }
    } catch (err) {
      console.log('Error fetching jobs, using local data:', err);
      // Fallback to local data on any error
      try {
        const localJobs = getAllJobs();
        const localInternships = getAllInternships();
        
        setJobs(localJobs);
        setInternships(localInternships);
        setError(null); // Clear error since we have fallback data
      } catch (localErr) {
        console.error('Error loading local data:', localErr);
        setError('Unable to load jobs. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  return { 
    jobs, 
    internships, 
    loading, 
    error, 
    refetch: fetchAvailableJobs,
    totalJobs: jobs.length,
    totalInternships: internships.length,
    totalOpportunities: jobs.length + internships.length
  };
}; 