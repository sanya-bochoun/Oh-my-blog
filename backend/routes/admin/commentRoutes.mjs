import express from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../../middleware/validateRequest.mjs';
import { authenticateToken, authorizeAdmin } from '../../middleware/auth.mjs';
import {
  getAllComments,
  approveComment,
  rejectComment,
  deleteComment,
  getCommentStats
} from '../../controllers/admin/commentController.mjs';

const router = express.Router();

// ตรวจสอบการยืนยันตัวตนและสิทธิ์ (Admin only)
router.use(authenticateToken, authorizeAdmin);

/**
 * @route   GET /api/admin/comments/stats
 * @desc    ดึงสถิติ comments
 * @access  Private (Admin only)
 */
router.get('/stats', getCommentStats);

/**
 * @route   GET /api/admin/comments
 * @desc    ดึง comments ทั้งหมดพร้อม filter และ pagination
 * @access  Private (Admin only)
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('is_approved').optional().isBoolean().withMessage('is_approved must be a boolean'),
  query('post_id').optional().isInt().withMessage('post_id must be an integer'),
  query('user_id').optional().isInt().withMessage('user_id must be an integer'),
  validateRequest
], getAllComments);

/**
 * @route   PUT /api/admin/comments/:id/approve
 * @desc    อนุมัติ comment
 * @access  Private (Admin only)
 */
router.put('/:id/approve', approveComment);

/**
 * @route   PUT /api/admin/comments/:id/reject
 * @desc    ไม่อนุมัติ comment
 * @access  Private (Admin only)
 */
router.put('/:id/reject', rejectComment);

/**
 * @route   DELETE /api/admin/comments/:id
 * @desc    ลบ comment (admin สามารถลบได้ทุก comment)
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteComment);

export default router;

