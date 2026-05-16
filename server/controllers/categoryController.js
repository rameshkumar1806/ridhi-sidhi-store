import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import slugify from 'slugify';

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

  const image = req.file ? req.file.path || `/uploads/${req.file.filename}` : req.body.image;

  const category = await Category.create({ name, slug, description, icon, image, sortOrder });
  res.status(201).json({ success: true, data: category });
});

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.body.name) updateData.slug = slugify(req.body.name, { lower: true, strict: true });
  if (req.file) updateData.image = req.file.path || `/uploads/${req.file.filename}`;

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ success: true, data: category });
});

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, message: 'Category deleted' });
});
