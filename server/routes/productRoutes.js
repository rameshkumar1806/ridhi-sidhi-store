import express from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, createReview, getFeaturedProducts, getSearchSuggestions,
  getInventoryStats,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/inventory/stats', protect, admin, getInventoryStats);
router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

router.post('/:id/reviews', protect, createReview);

export default router;
