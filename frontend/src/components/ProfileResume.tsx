import React, { useRef, useState } from 'react';

// Simulated user object (replace with real user fetch in production)
const user = {
  _id: '64e1f1b2c2a4e2a1b1c1d1e1', // Replace with real user id
  resumeUrl: '', // Fill with actual resumeUrl if uploaded
  resumePublicId: '' // Fill with actual resumePublicId if uploaded
};

const CLOUD_NAME = 'djlzqzuak'; // Use your Cloudinary cloud name

export default function ProfileResume() {
  const [resumeUrl, setResumeUrl] = useState(user.resumeUrl);
  const [resumePublicId, setResumePublicId] = useState(user.resumePublicId);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Upload handler
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  if (!fileInput.current) return;
  const file = fileInput.current.files?.[0];
  if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', user._id); // Simulate auth
    const res = await fetch('/api/uploadResume', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      setResumeUrl(data.url);
      setResumePublicId(data.publicId);
    } else {
      alert('Upload failed: ' + (data.error || 'Unknown error'));
    }
  }

  // Copy link
  function copyLink() {
    navigator.clipboard.writeText(resumeUrl);
    alert('Copied!');
  }

  // Cloudinary PDF thumbnail
  const thumbnail = resumePublicId
    ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/pg_1/w_900/${resumePublicId}.pdf.jpg`
    : '';

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Profile Resume Viewer</h2>
      {resumeUrl ? (
        <div>
          <button onClick={() => setShowModal(true)} style={{ margin: 4 }}>View Resume</button>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{ margin: 4 }}>Open in new tab</a>
          <button onClick={copyLink} style={{ margin: 4 }}>Copy link</button>
          <div style={{ margin: '1rem 0' }}>
            <img
              src={thumbnail}
              alt="Resume thumbnail"
              style={{ width: '100%', border: '1px solid #eee' }}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          {showModal && (
            <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
              <div style={{ background:'#fff', margin:'5vh auto', padding:20, maxWidth:800, borderRadius:8 }} onClick={e => e.stopPropagation()}>
                <iframe src={resumeUrl} title="Resume PDF" style={{ width:'100%', height:600, border:'none' }} />
                <button onClick={() => setShowModal(false)} style={{ marginTop: 10 }}>Close</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleUpload}>
          <input type="file" accept="application/pdf" ref={fileInput} required style={{ margin: 4 }} />
          <button type="submit" disabled={uploading} style={{ margin: 4 }}>{uploading ? 'Uploading...' : 'Upload Resume'}</button>
        </form>
      )}
      {/* Minimal CSS, all inline. */}
      {/* Comments for clarity. */}
    </div>
  );
}

// Cloudinary PDF delivery must be enabled in your Cloudinary Console (Settings → Security).
// For client-side uploads, set up an Unsigned Upload Preset and add upload_preset to the FormData.
