const express = require('express');
const authMiddleware = require('../middleware/auth');
const UserProfile = require('../models/userProfile');
const router = express.Router();
const Application = require('../models/application');

// Ensure a profile exists for the authenticated user
async function getOrCreateProfile(userId, seed = {}) {
	let profile = await UserProfile.findOne({ userId });
	if (!profile) {
		profile = new UserProfile({ userId, ...seed });
		await profile.save();
	}
	return profile;
}

// GET /api/user-profile - get current user's profile
router.get('/', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId, {
			personalInfo: {
				email: req.user.email || '',
				firstName: req.user.firstName || ''
			}
		});

		// If existing profile is missing email, backfill from auth user
		if ((!profile.personalInfo || !profile.personalInfo.email) && req.user.email) {
			profile.personalInfo = {
				...(profile.personalInfo ? profile.personalInfo.toObject?.() || profile.personalInfo : {}),
				email: req.user.email
			};
			await profile.save();
		}

			// Compute applications count
			let applicationCount = 0;
			try {
				applicationCount = await Application.countDocuments({ userId });
			} catch (e) {
				applicationCount = 0;
			}

				// Flatten fields for simple UserProfile page compatibility
				const obj = profile.toObject();
				const pi = obj.personalInfo || {};
				const pb = obj.professionalBio || {};
				const sl = obj.socialLinks || {};
				const rv = obj.resume || {};

				res.json({
					...obj,
					// convenience top-level
					email: pi.email || req.user.email || '',
					applicationCount,
					// flat mapping used by simple page UI
					firstName: pi.firstName || '',
					lastName: pi.lastName || '',
					phone: pi.phone || '',
					location: pi.location || '',
					currentPosition: pb.currentPosition || '',
					currentCompany: pb.currentCompany || '',
					experience: pb.experience || '',
					expectedSalary: pb.expectedSalary || '',
					skills: (obj.skills && obj.skills.technicalSkills) || '',
					bio: pb.bio || '',
					linkedin: sl.linkedin || '',
					github: sl.github || '',
					twitter: sl.twitter || '',
					website: sl.website || '',
					resume: rv.fileUrl || '',
					profilePicture: obj.profilePicture || ''
				});
	} catch (error) {
		console.error('Error fetching user profile:', error);
		res.status(500).json({ error: 'Failed to fetch user profile' });
	}
});

// GET /api/user-profile/completion - get completion status
router.get('/completion', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId);
		res.json(profile.getCompletion());
	} catch (error) {
		console.error('Error fetching profile completion:', error);
		res.status(500).json({ error: 'Failed to fetch profile completion' });
	}
});

// PATCH helpers
function markSection(profile, section) {
	profile.sectionsCompleted = profile.sectionsCompleted || {};
	profile.sectionsCompleted[section] = true;
	profile.lastSectionUpdated = section;
}

// PATCH /api/user-profile/personal-info
router.patch('/personal-info', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId);
		const incoming = { ...req.body };
			// allow overriding email if provided; otherwise use token email
			if ((!incoming.email || incoming.email === '') && req.user.email) {
				incoming.email = req.user.email;
			}
		profile.personalInfo = { ...(profile.personalInfo ? profile.personalInfo.toObject() : {}), ...incoming };
		markSection(profile, 'personalInfo');
		await profile.save();
		res.json({ message: 'Personal information updated successfully', data: profile.personalInfo });
	} catch (error) {
		console.error('Error updating personal info:', error);
		res.status(500).json({ error: 'Failed to update personal info' });
	}
});

// PATCH /api/user-profile/professional-bio
router.patch('/professional-bio', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId);
		profile.professionalBio = { ...profile.professionalBio.toObject(), ...req.body };
		markSection(profile, 'professionalBio');
		await profile.save();
		res.json({ message: 'Professional bio updated successfully', data: profile.professionalBio });
	} catch (error) {
		console.error('Error updating professional bio:', error);
		res.status(500).json({ error: 'Failed to update professional bio' });
	}
});

// PATCH /api/user-profile/skills
router.patch('/skills', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId);
		profile.skills = { ...profile.skills.toObject(), ...req.body };
		markSection(profile, 'skills');
		await profile.save();
		res.json({ message: 'Skills updated successfully', data: profile.skills });
	} catch (error) {
		console.error('Error updating skills:', error);
		res.status(500).json({ error: 'Failed to update skills' });
	}
});

// PATCH /api/user-profile/resume
router.patch('/resume', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId);
		profile.resume = { ...profile.resume.toObject(), ...req.body };
		markSection(profile, 'resume');
		await profile.save();
		res.json({ message: 'Resume updated successfully', data: profile.resume });
	} catch (error) {
		console.error('Error updating resume:', error);
		res.status(500).json({ error: 'Failed to update resume' });
	}
});

// PATCH /api/user-profile/social-links
router.patch('/social-links', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const profile = await getOrCreateProfile(userId);
		profile.socialLinks = { ...profile.socialLinks.toObject(), ...req.body };
		markSection(profile, 'socialLinks');
		await profile.save();
		res.json({ message: 'Social links updated successfully', data: profile.socialLinks });
	} catch (error) {
		console.error('Error updating social links:', error);
		res.status(500).json({ error: 'Failed to update social links' });
	}
});

// PATCH /api/user-profile/education
router.patch('/education', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const { educationHistory } = req.body;
		const profile = await getOrCreateProfile(userId);
		if (Array.isArray(educationHistory)) {
			profile.educationHistory = educationHistory;
		}
		markSection(profile, 'educationHistory');
		await profile.save();
		res.json({ message: 'Education history updated successfully', data: profile.educationHistory });
	} catch (error) {
		console.error('Error updating education history:', error);
		res.status(500).json({ error: 'Failed to update education history' });
	}
});

// PATCH /api/user-profile/experience
router.patch('/experience', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const { experienceHistory } = req.body;
		const profile = await getOrCreateProfile(userId);
		if (Array.isArray(experienceHistory)) {
			profile.experienceHistory = experienceHistory;
		}
		markSection(profile, 'experienceHistory');
		await profile.save();
		res.json({ message: 'Experience history updated successfully', data: profile.experienceHistory });
	} catch (error) {
		console.error('Error updating experience history:', error);
		res.status(500).json({ error: 'Failed to update experience history' });
	}
});

// PATCH /api/user-profile - generic updater for flat payloads from simple page
router.patch('/', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.userId;
		const body = req.body || {};
		const profile = await getOrCreateProfile(userId, {
			personalInfo: { email: req.user.email || '', firstName: req.user.firstName || '' }
		});

		// Personal info
		const pi = profile.personalInfo ? profile.personalInfo.toObject() : {};
		if (body.firstName !== undefined) pi.firstName = body.firstName;
		if (body.lastName !== undefined) pi.lastName = body.lastName;
		// Always prefer token email if not explicitly provided
		pi.email = body.email || req.user.email || pi.email || '';
		if (body.phone !== undefined) pi.phone = body.phone;
		if (body.location !== undefined) pi.location = body.location;
		profile.personalInfo = pi;

		// Professional bio
		const pb = profile.professionalBio ? profile.professionalBio.toObject() : {};
		if (body.bio !== undefined) pb.bio = body.bio;
		if (body.currentPosition !== undefined) pb.currentPosition = body.currentPosition;
		if (body.currentCompany !== undefined) pb.currentCompany = body.currentCompany;
		if (body.experience !== undefined) pb.experience = body.experience;
		if (body.expectedSalary !== undefined) pb.expectedSalary = body.expectedSalary;
		profile.professionalBio = pb;

		// Skills (flat string -> technicalSkills)
		const sk = profile.skills ? profile.skills.toObject() : {};
		if (body.skills !== undefined) sk.technicalSkills = body.skills;
		profile.skills = sk;

		// Social links
		const sl = profile.socialLinks ? profile.socialLinks.toObject() : {};
		['linkedin','github','twitter','website'].forEach((k) => {
			if (body[k] !== undefined) sl[k] = body[k];
		});
		profile.socialLinks = sl;

		// Resume (store as fileUrl)
		if (body.resume !== undefined) {
			const rv = profile.resume ? profile.resume.toObject() : {};
			rv.fileUrl = body.resume;
			profile.resume = rv;
		}

		// Profile picture
			if (body.profilePicture !== undefined) {
				profile.profilePicture = body.profilePicture; // can be base64 data URL like company logo
			}

		// Mark sections as completed based on provided fields
		const sc = profile.sectionsCompleted || {};
		if (pi.firstName || pi.lastName || pi.email || pi.phone || pi.location) sc.personalInfo = true;
		if (pb.bio || pb.currentPosition || pb.currentCompany || pb.experience || pb.expectedSalary) sc.professionalBio = true;
		if (profile.skills?.technicalSkills) sc.skills = true;
		if (profile.resume?.fileUrl) sc.resume = true;
		if (sl.linkedin || sl.github || sl.twitter || sl.website) sc.socialLinks = true;
		profile.sectionsCompleted = sc;

		await profile.save();

		// Count applications
		let applicationCount = 0;
		try { applicationCount = await Application.countDocuments({ userId }); } catch {}

		return res.json({
			message: 'Profile updated successfully',
			data: {
				...profile.toObject(),
				email: profile.personalInfo?.email || req.user.email || '',
				applicationCount
			}
		});
	} catch (error) {
		console.error('Error updating user profile:', error);
		res.status(500).json({ error: 'Failed to update user profile' });
	}
});

module.exports = router;

