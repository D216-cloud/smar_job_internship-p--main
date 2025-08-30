const express = require('express');
const router = express.Router();
const UserProfile = require('../models/userProfile');
const Job = require('../models/job');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateJSON, getDeepseekConfig } = require('../utils/llmClient');
const { localFallbackScore } = require('../utils/localScorer');
const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// DeepSeek config check
const deepseekCfg = getDeepseekConfig();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const MatchResult = require('../models/matchResult');
const { generateTerminalLog } = require('../utils/terminalLogger');

// Small in-memory caches to accelerate repeated requests
const pdfTextCache = new Map(); // key: url -> { text, expires }
const matchCache = new Map();   // key: `${userId}:${jobId}` -> { match, expires }

// Helper function to extract text from PDF (with caching)
async function extractTextFromPDF(pdfUrl) {
  try {
    if (!pdfUrl) throw new Error('No PDF URL provided');
    console.log('📄 Fetching PDF from:', pdfUrl);

    const cached = pdfTextCache.get(pdfUrl);
    if (cached && cached.expires > Date.now()) {
      console.log('⚡ Using cached PDF text');
      return cached.text;
    }

    // Try direct fetch first (public files)
    let response = null;
    try {
      response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'SmartHire-AI-Matcher/1.0',
          'Accept': 'application/pdf'
        },
        maxRedirects: 5
      });
    } catch (err) {
      const status = err?.response?.status;
      console.warn(`⚠️ Direct fetch failed (${status || err.message}).`);

      // If this looks like a Cloudinary URL, attempt signed/private URL fallbacks
      if (pdfUrl.includes('cloudinary.com')) {
        // Extract publicId (path after /upload/ without extension or query)
        let publicId = '';
        try {
          const m = pdfUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.|$|\?)/);
          if (m && m[1]) publicId = m[1].replace(/\?.*$/, '');
        } catch (ex) {
          console.warn('⚠️ publicId extraction failed:', ex.message);
        }

        if (publicId) {
          // Try private_download_url for raw/private resources
          try {
            const expires_at = Math.floor(Date.now() / 1000) + 300; // 5 minutes
            const signed = cloudinary.utils.private_download_url(publicId, null, {
              resource_type: 'raw',
              type: 'private',
              expires_at
            });
            console.log('🔑 Retrying with private_download_url for public_id:', publicId);
            response = await axios.get(signed, {
              responseType: 'arraybuffer',
              timeout: 15000,
              headers: {
                'User-Agent': 'SmartHire-AI-Matcher/1.0',
                'Accept': 'application/pdf'
              }
            });
          } catch (privateErr) {
            console.warn('⚠️ private_download_url failed:', privateErr?.message || privateErr);
            // Try cloudinary.url with sign_url
            try {
              const signed2 = cloudinary.url(publicId, {
                resource_type: 'raw',
                type: 'upload',
                sign_url: true
              });
              console.log('🔑 Retrying with cloudinary.url(sign_url) for public_id:', publicId);
              response = await axios.get(signed2, {
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                  'User-Agent': 'SmartHire-AI-Matcher/1.0',
                  'Accept': 'application/pdf'
                }
              });
            } catch (signedErr) {
              console.warn('⚠️ cloudinary.url(sign_url) also failed:', signedErr?.message || signedErr);
            }
          }
        }
      }
    }

    if (!response || response.status !== 200) {
      throw new Error(`HTTP ${response?.status || 'no response'}: ${response?.statusText || 'failed to fetch'}`);
    }

    // Basic PDF header check
    const header = Buffer.from(response.data).slice(0, 5).toString();
    if (!header.includes('%PDF')) {
      throw new Error('Invalid PDF format');
    }

    const data = await pdfParse(response.data);
    console.log('✅ PDF text extracted successfully, length:', data.text?.length || 0);

    // cache for 3 minutes
    pdfTextCache.set(pdfUrl, { text: data.text, expires: Date.now() + 3 * 60 * 1000 });
    return data.text;
  } catch (error) {
    console.error('❌ Error extracting text from PDF:', error.message || error);
    const cached = pdfTextCache.get(pdfUrl);
    if (cached) {
      console.log('⚠️ Using cached content as fallback');
      return cached.text;
    }
    throw new Error(`Failed to extract PDF text: ${error.message || error}`);
  }
}

// Helper function to extract text from DOCX (basic implementation)
async function extractTextFromDOCX(docxUrl) {
  try {
    // For now, we'll return a placeholder since DOCX parsing requires additional libraries
    // In production, you might want to use mammoth.js or similar
    return 'DOCX content extraction not implemented yet. Please upload PDF format.';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return '';
  }
}

// Helper function to extract text from resume file
async function extractResumeText(fileUrl) {
  if (!fileUrl) return '';
  
  const fileExtension = fileUrl.split('.').pop().toLowerCase();
  
  if (fileExtension === 'pdf') {
    return await extractTextFromPDF(fileUrl);
  } else if (fileExtension === 'docx' || fileExtension === 'doc') {
    return await extractTextFromDOCX(fileUrl);
  } else {
    return 'Unsupported file format. Please upload PDF or DOCX.';
  }
}

// AI Matching endpoint
router.post('/match', authMiddleware, async (req, res) => {
  try {
    const { userId, jobId, fastFirst } = req.body || {};

    if (!userId || !jobId) {
      return res.status(400).json({ 
        error: 'userId and jobId are required' 
      });
    }

    // Authorization: user can only analyze their own profile
    const requesterUserId = req.user && (req.user.userId || req.user.id);
    if (!requesterUserId || requesterUserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden: You can only analyze your own resume' });
    }

    console.log('🔍 AI Matching Request:', { userId, jobId, requesterUserId });

    // Quick cache check for recent results
    const cacheKey = `${userId}:${jobId}`;
    const cachedMatch = matchCache.get(cacheKey);
    if (cachedMatch && cachedMatch.expires > Date.now()) {
      return res.json({ success: true, match: cachedMatch.match, jobTitle: cachedMatch.jobTitle, companyName: cachedMatch.companyName, source: cachedMatch.source, cached: true });
    }

    // Fetch user profile data
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      console.log('❌ No user profile found for userId:', userId);
      return res.json({
        success: true,
        match: {
          fitScore: 0,
          summary: "No user profile found. Please complete your profile and upload your resume.",
          strengths: [],
          weaknesses: ["No profile data"],
          recommendations: ["Complete your profile and upload your resume in PDF format."]
        },
        jobTitle: "",
        companyName: ""
      });
    }

    // Fetch job data
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('❌ No job found for jobId:', jobId);
      return res.json({
        success: true,
        match: {
          fitScore: 0,
          summary: "Job not found. Please select a valid job.",
          strengths: [],
          weaknesses: ["No job data"],
          recommendations: ["Select a valid job to analyze match."]
        },
        jobTitle: "",
        companyName: ""
      });
    }

    console.log('✅ Found user profile and job:', { 
      profileId: userProfile._id, 
      jobTitle: job.title,
      hasResume: !!(userProfile.resume && userProfile.resume.fileUrl)
    });

    // Extract resume text
    let resumeText = "";
    if (userProfile.resume && userProfile.resume.fileUrl) {
      try {
        console.log('📄 Extracting resume text from:', userProfile.resume.fileUrl);
        resumeText = await extractResumeText(userProfile.resume.fileUrl);
        console.log('✅ Resume text extracted, length:', resumeText.length);
      } catch (extractError) {
        console.error('❌ Resume extraction failed:', extractError);
        resumeText = "Failed to extract resume text. Please ensure your resume is uploaded as a PDF.";
      }
    } else {
      console.log('❌ No resume found in user profile');
      resumeText = "Resume not uploaded.";
    }

    // Prepare data for AI analysis
    const userData = {
      personalInfo: userProfile.personalInfo,
      professionalBio: userProfile.professionalBio,
      skills: userProfile.skills,
      educationHistory: userProfile.educationHistory,
      experienceHistory: userProfile.experienceHistory
    };

    const jobData = {
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      experienceLevel: job.experienceLevel
    };

    // Prepare a fast local fallback score while we call the AI
    const fallback = (() => {
      try {
        const fb = localFallbackScore({
          title: job.title,
          company: job.company,
          description: job.description || '',
          requirements: job.requirements || '',
          skills: job.skills || '',
          experienceLevel: job.experienceLevel || ''
        }, resumeText || '', userProfile?.toObject ? userProfile.toObject() : userProfile);
        return {
          fitScore: fb.matchScore,
          summary: `${fb.reason} Recommendation: ${fb.recommendation.replace('_', ' ')}.`,
          strengths: (fb.matchedSkills || []).slice(0, 6),
          weaknesses: (fb.missingSkills || []).slice(0, 6),
          recommendations: [
            fb.recommendation === 'recommend' ? 'Strong fit—consider applying soon.' : fb.recommendation === 'consider' ? 'Consider improving missing skills and reapplying.' : 'Target roles that better match your skills.',
            ...(resumeText && resumeText.length > 0 ? [] : ['Upload a detailed PDF resume for better analysis.'])
          ]
        };
      } catch (e) {
        return { fitScore: 50, summary: 'Preliminary score generated.', strengths: [], weaknesses: [], recommendations: ['Upload a PDF resume', 'Complete profile details'] };
      }
    })();

    // Create concise prompt for DeepSeek
    const prompt = `
    You are an AI job matching expert. Analyze the match between a candidate and a job position.

    CANDIDATE PROFILE:
    Personal Info: ${JSON.stringify(userData.personalInfo || {})}
    Professional Bio: ${JSON.stringify(userData.professionalBio || {})}
    Technical Skills: ${JSON.stringify(userData.skills || {})}
    Education History: ${JSON.stringify(userData.educationHistory || [])}
    Work Experience: ${JSON.stringify(userData.experienceHistory || [])}
    Resume Text: ${String(resumeText || '').substring(0, 2000)}

    JOB REQUIREMENTS:
    Title: ${jobData.title}
    Company: ${jobData.company}
    Description: ${jobData.description}
    Requirements: ${jobData.requirements}
    Required Skills: ${jobData.skills}
    Experience Level: ${jobData.experienceLevel}

    Analyze the match and provide a JSON response with exactly this structure:
    {
      "fitScore": <number from 0 to 100>,
      "summary": "<2-3 sentence summary of the match>",
      "strengths": ["<matching skill 1>", "<matching skill 2>", "<matching experience>"],
      "weaknesses": ["<missing skill 1>", "<gap in experience>"],
      "recommendations": ["<specific advice 1>", "<specific advice 2>"]
    }

    Focus on technical skills match, experience level alignment, and job requirements coverage.
    `;

    // Call DeepSeek with a strict time budget; fall back if it exceeds
    console.log('🤖 Calling DeepSeek with prompt length:', prompt.length);
    if (!deepseekCfg.ok) {
      // If AI isn’t configured, immediately return fallback for speed
      const out = { success: true, match: fallback, jobTitle: job.title, companyName: job.company, source: 'fallback' };
      matchCache.set(cacheKey, { ...out, expires: Date.now() + 5 * 60 * 1000 });
      return res.json(out);
    }

    const TIME_BUDGET = fastFirst ? 18000 : 22000;
    const genPromise = generateJSON(prompt, { timeoutMs: TIME_BUDGET });
    const timerPromise = new Promise(resolve => setTimeout(() => resolve({ ok: false, text: '', error: 'timeout' }), TIME_BUDGET + 2000));
    const gen = await Promise.race([genPromise, timerPromise]);

    if (!gen.ok) {
      // Return fallback quickly if AI slow or failed
      const out = { success: true, match: fallback, jobTitle: job.title, companyName: job.company, source: 'fallback' };
      matchCache.set(cacheKey, { ...out, expires: Date.now() + 2 * 60 * 1000 });
      return res.json(out);
    }

    const text = gen.text || '';
    console.log('✅ DeepSeek response received, length:', text.length);
    console.log('📝 DeepSeek response preview:', text.substring(0, 200) + '...');

    // Parse the JSON response
    let aiAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text or code fences)
      const cleaned = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
        
        // Validate required fields and provide defaults
        aiAnalysis.fitScore = typeof aiAnalysis.fitScore === 'number' ? Math.min(Math.max(aiAnalysis.fitScore, 0), 100) : 50;
        aiAnalysis.summary = aiAnalysis.summary || 'Analysis completed successfully.';
        aiAnalysis.strengths = Array.isArray(aiAnalysis.strengths) ? aiAnalysis.strengths : ['Profile reviewed'];
        aiAnalysis.weaknesses = Array.isArray(aiAnalysis.weaknesses) ? aiAnalysis.weaknesses : ['Areas for improvement identified'];
        aiAnalysis.recommendations = Array.isArray(aiAnalysis.recommendations) ? aiAnalysis.recommendations : ['Continue professional development'];
        
        console.log('✅ Successfully parsed AI response:', aiAnalysis);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.error('Raw response:', text.substring(0, 500));
      // Robust fallback response
      const extractedScore = text.match(/(\d+)%?/)?.[1] || text.match(/score[:\s]*(\d+)/i)?.[1] || '50';
      aiAnalysis = {
        fitScore: Math.min(Math.max(parseInt(extractedScore, 10), 0), 100),
        summary: `Analysis completed. The candidate's profile shows ${resumeText ? 'resume content available' : 'limited resume data'} for ${jobData.title} position.`,
        strengths: resumeText ? ['Resume uploaded', 'Profile data available'] : ['Profile partially complete'],
        weaknesses: resumeText ? ['Detailed analysis pending'] : ['Resume not uploaded', 'Profile incomplete'],
        recommendations: ['Upload a detailed resume', 'Complete profile sections', 'Apply to relevant positions']
      };
    }

    // ✅ Ensure the terminal log and frontend show the **same final score** from DeepSeek
    // Log the actual AI result for clarity
    console.log('🎯 Final AI Analysis Result (used in response):', { fitScore: aiAnalysis.fitScore, jobTitle: job.title });

    const out = { 
      success: true, 
      match: aiAnalysis, 
      jobTitle: job.title, 
      companyName: job.company, 
      source: 'ai' 
    };
    matchCache.set(cacheKey, { ...out, expires: Date.now() + 5 * 60 * 1000 });

    try {
      // Generate a terminal-style log for storage (non-blocking best-effort)
      const term = generateTerminalLog({
        resume_source: userProfile.resume?.fileUrl || 'user_resume',
        job_title: job.title,
        job_id: job._id,
        steps: ['fetch_pdf', 'extract_text', 'call_deepseek', 'score', 'render'],
        results: {
          fitScore: aiAnalysis.fitScore,
          matchedSkills: aiAnalysis.strengths,
          missingSkills: aiAnalysis.weaknesses
        }
      });

      // Extract evidence snippets if available in aiAnalysis.evidence or from parsed text
      let evidence = [];
      if (Array.isArray(aiAnalysis.evidence)) evidence = aiAnalysis.evidence.slice(0, 10);
      else if (typeof aiAnalysis.evidence === 'string') evidence = [aiAnalysis.evidence];

      const mr = new MatchResult({
        userId: userId,
        userName: `${userProfile.personalInfo?.firstName || ''} ${userProfile.personalInfo?.lastName || ''}`.trim(),
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.company,
        source: 'ai',
        fitScore: aiAnalysis.fitScore,
        matchedSkills: Array.isArray(aiAnalysis.strengths) ? aiAnalysis.strengths : [],
        missingSkills: Array.isArray(aiAnalysis.weaknesses) ? aiAnalysis.weaknesses : [],
        evidence,
        jobSnapshot: { title: job.title, requirements: job.requirements, skills: job.skills },
        resumeSnapshot: { resumeText: resumeText ? resumeText.substring(0, 2000) : '' , profileSnapshot: userProfile },
    rawAiResponse: aiAnalysis,
    summary: aiAnalysis.summary || '',
    recommendations: Array.isArray(aiAnalysis.recommendations) ? aiAnalysis.recommendations : [],
        match: aiAnalysis,
        terminalLog: term
      });
      await mr.save();
      // attach saved id for frontend if needed
      out.matchId = mr._id;
    } catch (saveErr) {
      console.warn('⚠️ Failed to save match result:', saveErr?.message || saveErr);
    }

    res.json(out);

  } catch (error) {
    console.error('❌ AI Matching Error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to analyze resume match';
    let statusCode = 500;
    
    if (error.message.includes('DEEPSEEK_API_KEY')) {
      errorMessage = 'AI service not configured properly';
      statusCode = 503;
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      errorMessage = 'Network error while contacting AI service';
      statusCode = 502;
    } else if (error.message.includes('PDF')) {
      errorMessage = 'Failed to extract text from resume. Please ensure your resume is a valid PDF file.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;