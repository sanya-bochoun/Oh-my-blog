/**
 * Metrics Routes
 * สำหรับดึง performance metrics (admin only)
 */

import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.mjs';
import performanceMonitor from '../utils/performance.mjs';

const router = express.Router();

// ต้องเป็น admin เท่านั้น
router.use(authenticateToken, authorizeAdmin);

/**
 * @route   GET /api/admin/metrics
 * @desc    ดึง performance metrics ทั้งหมด
 * @access  Private (Admin only)
 */
router.get('/', (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch metrics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/metrics/summary
 * @desc    ดึง performance metrics summary
 * @access  Private (Admin only)
 */
router.get('/summary', (req, res) => {
  try {
    const summary = performanceMonitor.getSummary();
    res.json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch metrics summary',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/metrics/reset
 * @desc    Reset performance metrics
 * @access  Private (Admin only)
 */
router.post('/reset', (req, res) => {
  try {
    performanceMonitor.reset();
    res.json({
      status: 'success',
      message: 'Metrics reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset metrics',
      error: error.message
    });
  }
});

export default router;

