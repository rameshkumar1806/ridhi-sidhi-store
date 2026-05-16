import express from 'express';
import { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', getBanners);
router.get('/admin', protect, admin, getAllBanners);
router.post('/admin', protect, admin, upload.single('image'), createBanner);
router.put('/admin/:id', protect, admin, upload.single('image'), updateBanner);
router.delete('/admin/:id', protect, admin, deleteBanner);

export default router;
