const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFExtract } = require('pdf.js-extract');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const { generateJSON, getDeepseekConfig } = require('../utils/llmClient');

// Configure Multer for file upload
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Check DeepSeek config
const deepseekCfg = getDeepseekConfig();

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  const pdfExtract = new PDFExtract();
  const options = {};
  
  try {
    const data = await pdfExtract.extract(filePath, options);
    return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from Word document
async function extractTextFromWord(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting Word text:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

// Extract text from resume
router.post('/extract-text', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let text;
    if (req.file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(req.file.path);
    } else {
      text = await extractTextFromWord(req.file.path);
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({ text });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// Analyze resume with DeepSeek
router.post('/analyze', async (req, res) => {
  const { resumeText, jobTitle, jobDescription, jobRequirements } = req.body;

  if (!resumeText || !jobTitle || !jobDescription) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const MAX_INPUT = 8000; // keep prompt small for faster responses
    const safeResume = (resumeText || '').slice(0, MAX_INPUT);
    const prompt = `
    Analyze the following resume text and compare it with the job requirements:

    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
    Job Requirements: ${jobRequirements}

  Resume Text (may be truncated):
  ${safeResume}

    Please provide:
    1. A match score percentage (0-100) based on how well the candidate's resume matches the job requirements
    2. A detailed analysis of the match, including:
       - Key skills that match the requirements
       - Missing or gaps in required skills
       - Relevant experience
       - Areas for improvement
    
    Format the response as a JSON object with two properties:
    - matchScore (number)
    - analysis (string with detailed analysis)
    `;

    if (!deepseekCfg.ok) {
      return res.status(503).json({ error: 'AI service not configured (DEEPSEEK_API_KEY missing)' });
    }
  const result = await generateJSON(prompt, { timeoutMs: 20000 });
    if (!result.ok) {
      throw new Error(result.error || 'DeepSeek generation failed');
    }
    const text = (result.text || '').replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
    try {
      const analysisData = JSON.parse(text);
      return res.json(analysisData);
    } catch (error) {
      // If parsing fails, provide a structured response
      const matchScore = parseInt(text.match(/\d+/)?.[0] || '0');
      return res.json({
        matchScore: Math.min(Math.max(matchScore, 0), 100),
        analysis: text
      });
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

module.exports = router;
