import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.mjs';
import { authenticateToken } from '../middleware/auth.mjs';
import {
  createTag,
  getAllTags,
  getTagById,
  getTagBySlug,
  updateTag,
  deleteTag,
  getTagPosts,
  getPopularTags
} from '../controllers/tagController.mjs';

const router = express.Router();

// Validation middleware
const tagValidation = [
  body('name').trim().notEmpty().withMessage('ชื่อแท็กไม่สามารถเป็นค่าว่างได้'),
  body('slug').optional().trim()
];

// Routes
router.post('/', authenticateToken, tagValidation, validateRequest, createTag);
router.get('/', getAllTags);
router.get('/popular', getPopularTags);
router.get('/slug/:slug', getTagBySlug);
router.get('/:id', getTagById);
router.get('/:id/posts', getTagPosts);
router.put('/:id', authenticateToken, tagValidation, validateRequest, updateTag);
router.delete('/:id', authenticateToken, deleteTag);

export default router; 