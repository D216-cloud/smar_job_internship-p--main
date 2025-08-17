const express = require('express');
const CompanyProfile = require('../models/companyProfile');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Test route to verify the router is loaded
router.get('/test', (req, res) => {
  console.log('✅ Company profile routes are loaded');
  res.json({ message: 'Company profile routes are working' });
});

// GET /api/company-profile - Get company profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 GET /api/company-profile - Fetching company profile');
    console.log('User ID:', req.user.userId);
    console.log('User data:', req.user);
    
    const companyId = req.user.userId;
    const profile = await CompanyProfile.findOne({ companyId }).populate('companyId', 'name email');
    
    console.log('Found profile:', profile);
    
    if (!profile) {
      console.log('No profile found, creating default profile...');
      // Create a default profile if none exists
      const defaultProfile = new CompanyProfile({
        companyId: companyId,
        name: req.user.name || req.user.firstName || '',
        email: req.user.email || '',
        createdAt: new Date()
      });
      
      await defaultProfile.save();
      console.log('Default profile created:', defaultProfile);
      return res.json(defaultProfile);
    }
    
    console.log('Returning existing profile');
    res.json(profile);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// PATCH /api/company-profile - Update company profile (single save for entire profile)
router.patch('/', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 PATCH /api/company-profile - Updating company profile');
    console.log('User ID:', req.user.userId);
    console.log('Update data:', req.body);
    
    const companyId = req.user.userId;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated
    delete updateData._id;
    delete updateData.companyId;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    console.log('Cleaned update data:', updateData);
    
    const profile = await CompanyProfile.findOneAndUpdate(
      { companyId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );
    
    console.log('Company profile updated successfully:', profile);
    res.json({
      message: 'Company profile updated successfully',
      data: profile,
      completionPercentage: profile.getCompletionPercentage()
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
});

// POST /api/company-profile - Create new company profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.userId;
    const profileData = {
      ...req.body,
      companyId: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const profile = new CompanyProfile(profileData);
    await profile.save();
    
    console.log('Company profile created successfully:', profile);
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating company profile:', error);
    res.status(500).json({ error: 'Failed to create company profile' });
  }
});

// DELETE /api/company-profile - Delete company profile
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.userId;
    await CompanyProfile.findOneAndDelete({ companyId });
    
    res.json({ message: 'Company profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting company profile:', error);
    res.status(500).json({ error: 'Failed to delete company profile' });
  }
});

// GET /api/company-profile/completion - Get profile completion status
router.get('/completion', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.userId;
    const profile = await CompanyProfile.findOne({ companyId });
    
    if (!profile) {
      return res.json({
        completionPercentage: 0,
        sections: ['basic', 'description', 'social', 'additional']
      });
    }
    
    res.json({
      completionPercentage: profile.getCompletionPercentage(),
      sections: ['basic', 'description', 'social', 'additional']
    });
  } catch (error) {
    console.error('Error fetching company profile completion:', error);
    res.status(500).json({ error: 'Failed to fetch company profile completion' });
  }
});

// GET /api/company-profile/public/:id - Get public company profile
router.get('/public/:id', async (req, res) => {
  try {
    const profile = await CompanyProfile.findById(req.params.id);
    
    if (!profile || !profile.isPublic) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    
    // Increment profile views
    await profile.incrementViews();
    
    res.json(profile.getPublicData());
  } catch (error) {
    console.error('Error fetching public company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// GET /api/company-profile/all - Get all company profiles (admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const profiles = await CompanyProfile.find({}).populate('companyId', 'name email');
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching all company profiles:', error);
    res.status(500).json({ error: 'Failed to fetch company profiles' });
  }
});

// POST /api/company-profile/increment-applications - Increment application count
router.post('/increment-applications', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.userId;
    const profile = await CompanyProfile.findOne({ companyId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Company profile not found' });
    }
    
    await profile.incrementApplications();
    
    res.json({ 
      message: 'Application count incremented',
      totalApplications: profile.totalApplications 
    });
  } catch (error) {
    console.error('Error incrementing application count:', error);
    res.status(500).json({ error: 'Failed to increment application count' });
  }
});

module.exports = router; 