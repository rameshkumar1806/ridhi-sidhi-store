import asyncHandler from 'express-async-handler';
import Banner from '../models/Banner.js';
import { cloudinary } from '../config/cloudinary.js';

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
  const image = req.file ? req.file.path : req.body.image;
  const public_id = req.file ? req.file.filename : undefined;
  const banner = await Banner.create({ ...req.body, image, public_id });
  res.status(201).json({ success: true, data: banner });
});

// @desc    Update banner (Admin)
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  const updateData = { ...req.body };
  if (req.file) {
    // Delete old image from Cloudinary if it exists
    if (banner.public_id) {
      try {
        await cloudinary.uploader.destroy(banner.public_id);
      } catch (err) {
        console.error(`Failed to delete banner image ${banner.public_id} from Cloudinary:`, err);
      }
    }
    updateData.image = req.file.path;
    updateData.public_id = req.file.filename;
  }

  const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json({ success: true, data: updatedBanner });
});

// @desc    Delete banner (Admin)
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  // Delete image from Cloudinary if it exists
  if (banner.public_id) {
    try {
      await cloudinary.uploader.destroy(banner.public_id);
    } catch (err) {
      console.error(`Failed to delete banner image ${banner.public_id} from Cloudinary:`, err);
    }
  }

  await banner.deleteOne();
  res.json({ success: true, message: 'Banner deleted' });
});
