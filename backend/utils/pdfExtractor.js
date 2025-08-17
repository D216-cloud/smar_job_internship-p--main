const axios = require('axios');
const pdfParse = require('pdf-parse');

async function downloadArrayBuffer(url, timeoutMs = 10000) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: timeoutMs });
  return res.data;
}

async function extractPdfTextFromUrl(url, opts = {}) {
  if (!url) return '';
  try {
    const arrBuf = await downloadArrayBuffer(url, opts.timeoutMs || 10000);
    const data = await pdfParse(arrBuf);
    return (data.text || '').trim();
  } catch (err) {
    console.warn('PDF extraction failed:', err?.message || err);
    return '';
  }
}

module.exports = {
  extractPdfTextFromUrl
};
