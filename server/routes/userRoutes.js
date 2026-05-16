import express from 'express';
import { getAllUsers, getUserById, toggleUserBlock, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id/toggle', protect, admin, toggleUserBlock);
router.delete('/:id', protect, admin, deleteUser);

export default router;
