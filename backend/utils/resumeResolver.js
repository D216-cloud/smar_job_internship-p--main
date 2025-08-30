const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

function getSignedCloudinaryUrl(publicId, expiresInSec = 120) {
  if (!publicId) return '';
  const expires_at = Math.floor(Date.now() / 1000) + Math.max(30, Math.min(600, expiresInSec));
  return cloudinary.utils.private_download_url(publicId, null, {
    resource_type: 'raw',
    type: 'private',
    expires_at
  });
}

async function resolveResumeDownloadUrl(userDoc, userProfileDoc, opts = {}) {
  const timeoutMs = opts.timeoutMs || 8000;
  const isHttp = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);

  const profileResume = userProfileDoc?.resume || {};
  const profileFileUrl = profileResume.fileUrl || profileResume.secureUrl || '';
  const profilePublicId = profileResume.publicId || '';

  const userResumeUrl = userDoc?.resumeUrl || '';
  const userPublicId = userDoc?.resumePublicId || '';

  let absoluteUrl = '';
  let publicId = '';
  let triedSigned = false;
  let reason = '';

  if (isHttp(profileFileUrl)) absoluteUrl = profileFileUrl;
  else if (isHttp(userResumeUrl)) absoluteUrl = userResumeUrl;

  if (!absoluteUrl) {
    if (profileFileUrl && !isHttp(profileFileUrl)) publicId = profileFileUrl.replace(/^\/+/, '');
    if (!publicId && profilePublicId) publicId = profilePublicId;
    if (!publicId && userPublicId) publicId = userPublicId;
  }

  if (absoluteUrl) {
    try {
      await axios.get(absoluteUrl, { responseType: 'arraybuffer', timeout: timeoutMs });
      return { url: absoluteUrl, triedSigned, reason: 'direct-url-ok' };
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        if (publicId) {
          const signed = getSignedCloudinaryUrl(publicId, 120);
          if (signed) {
            triedSigned = true;
            try {
              await axios.get(signed, { responseType: 'arraybuffer', timeout: timeoutMs });
              return { url: signed, usedPublicId: publicId, triedSigned, reason: 'unsigned-401-signed-ok' };
            } catch (e2) {
              reason = 'signed-url-also-failed';
            }
          }
        }
      } else {
        reason = `direct-url-error-${err?.response?.status || 'network'}`;
      }
    }
  }

  if (!absoluteUrl && publicId) {
    const signed = getSignedCloudinaryUrl(publicId, 120);
    return { url: signed, usedPublicId: publicId, triedSigned: true, reason: 'signed-from-publicId' };
  }

  return { url: '', triedSigned, reason: reason || 'no-url-found' };
}

module.exports = {
  getSignedCloudinaryUrl,
  resolveResumeDownloadUrl
};
