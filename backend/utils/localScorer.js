function normalizeText(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/react\.?js/g, 'react')
    .replace(/node\.?js/g, 'node')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s) {
  return normalizeText(s).split(/[^a-z0-9+#.]+/).filter(Boolean);
}

function unique(arr) { return Array.from(new Set(arr)); }

function intersect(a, bSet) {
  return a.filter(x => bSet.has(x));
}

function extractResumeBits(resumeText, profile) {
  const text = normalizeText(resumeText || '');
  const sentences = text.split(/(?<=[.!?])\s+/);
  const skills = [];
  const skillLines = sentences.filter(s => /skills|technologies|tech stack|stack/.test(s)).slice(0, 3);
  skillLines.forEach(l => skills.push(...tokenize(l)));

  const profileSkills = [
    profile?.skills?.technicalSkills || '',
    profile?.skills?.softSkills || '',
    Array.isArray(profile?.skills?.languages) ? profile.skills.languages.join(',') : ''
  ].join(',');
  const profileTokens = tokenize(profileSkills);

  const expItems = (profile?.experienceHistory || []).slice(-3).map(e => [e.position, e.company, (e.technologies || []).join(',')].join(' '));
  const expTokens = tokenize(expItems.join(' '));

  const resumeSkills = unique([...skills, ...profileTokens, ...expTokens]);
  return { sentences, resumeSkills };
}

function scoreExperienceLevel(jobLevel = '', profile = {}) {
  const jl = normalizeText(jobLevel);
  const expYearsFromProfile = (() => {
    const bio = normalizeText(profile?.professionalBio?.experience || profile?.professionalBio?.bio || '');
    const m = bio.match(/(\d+)(?:\+)?\s*(?:years|year|yrs|yr)/);
    return m ? parseInt(m[1], 10) : 0;
  })();

  const reqYears = (() => {
    const m = jl.match(/(\d+)(?:\+)?\s*(?:years|year|yrs|yr)/);
    return m ? parseInt(m[1], 10) : 0;
  })();

  let score = 50;
  if (reqYears) {
    score = expYearsFromProfile >= reqYears ? 100 : Math.max(0, Math.round((expYearsFromProfile / reqYears) * 100));
  }
  return score;
}

function keywordOverlapScore(jobText, resumeText) {
  const jt = unique(tokenize(jobText));
  const rt = new Set(unique(tokenize(resumeText)));
  if (!jt.length || !rt.size) return 0;
  const matched = jt.filter(t => rt.has(t)).length;
  const ratio = matched / jt.length;
  return Math.round(ratio * 100);
}

function inferSkillsFromText(title = '', description = '') {
  const base = normalizeText([title, description].filter(Boolean).join(' '));
  // Common tech keywords; extend as needed
  const keywords = [
    'javascript','typescript','react','node','express','mongodb','postgres','sql','python','django','flask','java','spring',
    'c++','c#','.net','go','golang','kubernetes','docker','aws','azure','gcp','html','css','tailwind','vue','angular',
    'next','nestjs','rest','graphql','microservices','redis','rabbitmq','kafka','ci','cd','git','jest','testing','storybook',
    'pandas','numpy','ml','machine','learning','tensorflow','pytorch','nlp','webpack','vite','babel','sass','less'
  ];
  const tokens = new Set(tokenize(base));
  return keywords.filter(k => tokens.has(k));
}

function localFallbackScore(job, resumeText, profile) {
  // Build as much job context as possible
  const jobSkillsText = [job.skills, job.requirements].filter(Boolean).join(', ');
  let requiredSkills = unique(tokenize(jobSkillsText));
  if (requiredSkills.length === 0) {
    // If job.skills/requirements are empty, infer from title/description
    requiredSkills = inferSkillsFromText(job.title || '', [job.description, job.requirements].filter(Boolean).join(' '));
  }
  const { sentences, resumeSkills } = extractResumeBits(resumeText, profile);

  const resumeSet = new Set(resumeSkills);
  const matchedSkills = intersect(requiredSkills, resumeSet);
  const missingSkills = requiredSkills.filter(s => !resumeSet.has(s));

  const skillScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 100 * 0.7 : 0;
  const experienceScore = scoreExperienceLevel(job.experienceLevel, profile) * 0.2;
  const keywordScore = keywordOverlapScore([job.title, job.description, job.requirements, job.skills].filter(Boolean).join(' '), resumeText) * 0.1;
  const finalScore = Math.max(0, Math.min(100, Math.round(skillScore + experienceScore + keywordScore)));

  const recommendation = finalScore > 75 ? 'recommend' : finalScore >= 45 ? 'consider' : 'not_recommended';

  const highlights = [];
  const originalSentences = (resumeText || '').split(/(?<=[.!?])\s+/).slice(0, 50);
  const lowerSentences = originalSentences.map(s => s.toLowerCase());
  for (let i = 0; i < lowerSentences.length && highlights.length < 3; i++) {
    if (matchedSkills.some(k => lowerSentences[i].includes(k))) {
      highlights.push(originalSentences[i].trim().slice(0, 160));
    }
  }

  const experienceMatch = (() => {
    const bio = (profile?.professionalBio?.experience || profile?.professionalBio?.bio || '').toString();
    return bio ? `Profile experience reference: ${bio.slice(0, 120)}` : 'Not enough information to compare experience.';
  })();

  const reason = finalScore > 75 ? 'Strong overlap with job skills and experience.' : finalScore >= 45 ? 'Partial match on skills and keywords.' : 'Limited skills overlap for this role.';

  return {
    matchScore: finalScore,
    matchedSkills: matchedSkills.slice(0, 20),
    missingSkills: missingSkills.slice(0, 20),
    experienceMatch,
    highlights,
    recommendation,
    reason
  };
}

module.exports = {
  localFallbackScore
};
