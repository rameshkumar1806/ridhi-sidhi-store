import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import slugify from 'slugify';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  res.json({ success: true, data: categories });
});

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, sortOrder } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const image = req.file ? req.file.path : req.body.image;
  const public_id = req.file ? req.file.filename : undefined;

  const category = await Category.create({ name, slug, description, icon, image, public_id, sortOrder });
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const updateData = { ...req.body };
  if (req.body.name) updateData.slug = slugify(req.body.name, { lower: true, strict: true });

  if (req.file) {
    // Delete old image from Cloudinary if it exists
    if (category.public_id) {
      try {
        await cloudinary.uploader.destroy(category.public_id);
      } catch (err) {
        console.error(`Failed to delete category image ${category.public_id} from Cloudinary:`, err);
      }
    }
    updateData.image = req.file.path;
    updateData.public_id = req.file.filename;
  }

  const updated = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updated });
});

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Delete image from Cloudinary if it exists
  if (category.public_id) {
    try {
      await cloudinary.uploader.destroy(category.public_id);
    } catch (err) {
      console.error(`Failed to delete category image ${category.public_id} from Cloudinary:`, err);
    }
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
