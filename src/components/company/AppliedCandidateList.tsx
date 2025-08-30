import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Candidate {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  skills: string;
  coverLetter: string;
  status: string;
  appliedAt: string;
  jobId: {
    _id: string;
    title: string;
    location: string;
    company: string;
  };
  resume?: string;
}

interface Props {
  candidates: Candidate[];
  onStatusChange?: (id: string, status: string) => void;
}

export const AppliedCandidateList: React.FC<Props> = ({ candidates, onStatusChange }) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Job Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Resume</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((c) => (
          <TableRow key={c._id}>
            <TableCell className="font-bold text-blue-700">{c.fullName}</TableCell>
            <TableCell>{c.email}</TableCell>
            <TableCell>{c.jobId?.title}</TableCell>
            <TableCell><Badge>{c.status}</Badge></TableCell>
            <TableCell>
              {c.resume ? (
                <a href={c.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
              ) : '—'}
            </TableCell>
            <TableCell>
              {onStatusChange && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onStatusChange(c._id, 'selected')}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => onStatusChange(c._id, 'rejected')}>Reject</Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
