import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Trash2, Download, Loader2, ScanText } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

interface Resume {
  url: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

interface ResumeUploadProps {
  onUploadSuccess?: (resumeUrl: string) => void;
  onDelete?: () => void;
  currentResumeUrl?: string | null;
}

const ResumeUpload = ({ onUploadSuccess, onDelete, currentResumeUrl }: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { userData } = useAuthContext();

  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/resume/current', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.resumeUrl) {
            setCurrentResume({
              url: data.data.resumeUrl,
              fileName: data.data.fileName || 'Resume.pdf',
              fileSize: data.data.fileSize || 0,
              uploadDate: data.data.uploadDate ? new Date(data.data.uploadDate).toISOString() : new Date().toISOString(),
            });
            return;
          }
        }
      } catch (e) {
        // ignore, fallback to prop below
      }
      if (currentResumeUrl) {
        setCurrentResume({
          url: currentResumeUrl,
          fileName: 'Resume.pdf',
          fileSize: 0,
          uploadDate: new Date().toISOString(),
        });
      } else {
        setCurrentResume(null);
    setExtractedText(null);
      }
    };
    loadCurrent();
  }, [currentResumeUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (allow .pdf extension fallback when MIME is missing)
      const isPdfMime = selectedFile.type === 'application/pdf';
      const isPdfExt = selectedFile.name?.toLowerCase().endsWith('.pdf');
      if (!isPdfMime && !isPdfExt) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file (.pdf)',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      const newResume = {
        url: data.data.resumeUrl,
        fileName: data.data.fileName || file.name,
        fileSize: data.data.fileSize ?? file.size,
        uploadDate: data.data.uploadDate || new Date().toISOString(),
      };

      setCurrentResume(newResume);
      setFile(null);
      
      // Call the callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(data.data.resumeUrl);
      }

      // Also update profile resume field to keep flat UI in sync
      try {
        await fetch('/api/user-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ resume: data.data.resumeUrl })
        });
      } catch (e) {
        // no-op
      }

      toast({
        title: 'Success',
        description: 'Resume uploaded successfully'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload resume',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentResume) return;

    try {
  setLoading(true);
      const response = await fetch('/api/resume/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete resume');
      }

      setCurrentResume(null);
  setExtractedText(null);
      // reflect in user-profile
      try {
        await fetch('/api/user-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ resume: '' })
        });
      } catch (e) {
        // no-op
      }
      
      // Call the callback if provided
      if (onDelete) {
        onDelete();
      }

      toast({
        title: 'Success',
        description: 'Resume deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete resume',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtractText = async () => {
    if (!currentResume) {
      toast({ title: 'No resume', description: 'Please upload a resume first', variant: 'destructive' });
      return;
    }
    try {
      setExtracting(true);
      const res = await fetch('/api/resume/extract-current', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to extract text');
      }
      setExtractedText(data.text || '');
      toast({ title: 'Extracted', description: `Found ${data.length ?? (data.text?.length || 0)} characters` });
    } catch (e) {
      console.error('Extract error:', e);
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to extract', variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Resume Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Resume Section */}
        {currentResume && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="space-y-1">
                  <span className="font-medium block">{currentResume.fileName}</span>
                  <span className="text-sm text-gray-500">
                    {(currentResume.fileSize / 1024 / 1024).toFixed(2)} MB
                    {currentResume.uploadDate && ` • Uploaded ${new Date(currentResume.uploadDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentResume.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractText}
                  disabled={extracting}
                >
                  {extracting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ScanText className="h-4 w-4 mr-1" />}
                  Extract Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            {extractedText !== null && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700">Extracted Text</Label>
                <div className="mt-2 max-h-72 overflow-auto rounded-md border bg-white p-3 text-sm whitespace-pre-wrap">
                  {extractedText || '—'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-4">
          <Label htmlFor="resume">Upload New Resume (PDF only, max 5MB)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
          
          {file && !loading && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
              <Button
                size="sm"
                onClick={handleUpload}
                className="flex items-center gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                Upload
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
