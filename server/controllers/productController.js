import asyncHandler from 'express-async-handler';
import slugify from 'slugify';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Get all products with filtering, search, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  // Search
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { brand: { $regex: req.query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.search, 'i')] } },
    ];
  }

  // Category filter
  if (req.query.category) {
    const cat = await Category.findOne({ slug: req.query.category });
    if (cat) filter.category = cat._id;
  }

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.rating) {
    filter.rating = { $gte: Number(req.query.rating) };
  }

  // Featured/BestSeller/Trending filters
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.bestSeller === 'true') filter.isBestSeller = true;
  if (req.query.trending === 'true') filter.isTrending = true;

  // Stock Status filters
  if (req.query.stockStatus === 'out') {
    filter.stock = 0;
  } else if (req.query.stockStatus === 'low') {
    filter.$expr = { $lte: ['$stock', '$lowStockAlert'] };
    filter.stock = { $gt: 0 };
  } else if (req.query.stockStatus === 'in') {
    filter.stock = { $gt: 0 };
  }

  // Sort
  let sortBy = {};
  switch (req.query.sort) {
    case 'price_asc':
    case 'price':
      sortBy = { price: 1 };
      break;
    case 'price_desc':
    case '-price':
      sortBy = { price: -1 };
      break;
    case 'rating':
    case '-rating':
      sortBy = { rating: -1 };
      break;
    case 'newest':
    case 'latest':
      sortBy = { createdAt: -1 };
      break;
    case 'popular':
      sortBy = { numReviews: -1 };
      break;
    case 'best_selling':
      sortBy = { soldCount: -1 };
      break;
    case 'stock_low':
      sortBy = { stock: 1 };
      break;
    case 'stock_high':
      sortBy = { stock: -1 };
      break;
    default:
      sortBy = { createdAt: -1 };
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const product = await Product.findOne({ ...query, isActive: true })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Increment view count
  await Product.findByIdAndUpdate(product._id, { $inc: { recentlyViewedCount: 1 } });

  // Get related products
  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(6)
    .select('name images price rating numReviews slug discount')
    .lean();

  res.json({ success: true, data: product, related });
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, shortDescription, brand, category,
    price, mrp, discount, stock, quantity, unitType, tags,
    isFeatured, isBestSeller, isTrending, gst, hsn, sku, lowStockAlert,
  } = req.body;

  // Generate unique slug
  let slug = slugify(name, { lower: true, strict: true });
  const existing = await Product.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now()}`;

  const images = req.files
    ? req.files.map((file) => ({
        url: file.path || `/uploads/${file.filename}`,
        public_id: file.filename,
        alt: name,
      }))
    : req.body.images
    ? JSON.parse(req.body.images)
    : [];

  const product = await Product.create({
    name, slug, description, shortDescription, brand, category,
    price, mrp, discount, stock: Number(stock) || 0, quantity, unitType,
    lowStockAlert: Number(lowStockAlert) || 5,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    images,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isBestSeller: isBestSeller === 'true' || isBestSeller === true,
    isTrending: isTrending === 'true' || isTrending === true,
    gst, hsn, sku,
  });

  await product.populate('category', 'name slug');
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updateData = { ...req.body };

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path || `/uploads/${file.filename}`,
      public_id: file.filename,
      alt: product.name,
    }));
    updateData.images = [...(product.images || []), ...newImages];
  }

  if (updateData.name && updateData.name !== product.name) {
    updateData.slug = slugify(updateData.name, { lower: true, strict: true });
  }

  if (updateData.tags && typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map((t) => t.trim());
  }

  if (updateData.stock) updateData.stock = Number(updateData.stock);
  if (updateData.lowStockAlert) updateData.lowStockAlert = Number(updateData.lowStockAlert);

  // Ensure quantity and unitType are preserved if not provided in body (unlikely but safe)
  if (!updateData.quantity && product.quantity) updateData.quantity = product.quantity;
  if (!updateData.unitType && product.unitType) updateData.unitType = product.unitType;

  const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.json({ success: true, data: updated });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Create/Update product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    alreadyReviewed.rating = rating;
    alreadyReviewed.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
  }

  await product.save();
  res.status(201).json({ success: true, message: 'Review submitted' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const featured = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .lean();
  const bestSellers = await Product.find({ isBestSeller: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .lean();
  const trending = await Product.find({ isTrending: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .lean();

  res.json({ success: true, data: { featured, bestSellers, trending } });
});

// @desc    Get search suggestions
// @route   GET /api/products/suggestions
// @access  Public
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, data: [] });

  const products = await Product.find({
    name: { $regex: q, $options: 'i' },
    isActive: true,
  })
    .select('name images price slug')
    .limit(5)
    .lean();

  res.json({ success: true, data: products });
});
// @desc    Get inventory stats (Admin)
// @route   GET /api/products/inventory/stats
// @access  Private/Admin
export const getInventoryStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  
  const stockStats = await Product.aggregate([
    {
      $group: {
        _id: null,
      totalStock: { $sum: '$stock' },
      totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
      },
    },
  ]);

  const outOfStock = await Product.countDocuments({ stock: 0 });
  const lowStock = await Product.countDocuments({
    $expr: { $lte: ['$stock', '$lowStockAlert'] },
    stock: { $gt: 0 },
  });

  const bestSellers = await Product.find()
    .sort({ soldCount: -1 })
    .limit(5)
    .select('name stock soldCount price images')
    .lean();

  res.json({
    success: true,
    data: {
      totalProducts,
      totalStock: stockStats[0]?.totalStock || 0,
      totalValue: stockStats[0]?.totalValue || 0,
      outOfStock,
      lowStock,
      bestSellers,
    },
  });
});
