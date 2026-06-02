import asyncHandler from 'express-async-handler';
import Banner from '../models/Banner.js';

// @desc    Get active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = asyncHandler(async (req, res) => {
  const type = req.query.type;
  const filter = { isActive: true };
  if (type) filter.type = type;
  const banners = await Banner.find(filter).sort({ sortOrder: 1 }).lean();

  const seen = new Set();
  const uniqueBanners = [];

  for (const banner of banners) {
    const key = (banner.title || '').trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueBanners.push(banner);
    } else {
      // Automatically remove duplicate banner record from database
      await Banner.findByIdAndDelete(banner._id);
    }
  }

  res.json({ success: true, data: uniqueBanners });
});

// @desc    Get all banners (Admin)
// @route   GET /api/admin/banners
// @access  Private/Admin
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ sortOrder: 1 }).lean();
  res.json({ success: true, data: banners });
});

// @desc    Create banner (Admin)
// @route   POST /api/admin/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
  const image = req.file ? req.file.path || `/uploads/${req.file.filename}` : req.body.image;
  const banner = await Banner.create({ ...req.body, image });
  res.status(201).json({ success: true, data: banner });
});

// @desc    Update banner (Admin)
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.image = req.file.path || `/uploads/${req.file.filename}`;
  const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  res.json({ success: true, data: banner });
});

// @desc    Delete banner (Admin)
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  res.json({ success: true, message: 'Banner deleted' });
});
