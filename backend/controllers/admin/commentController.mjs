import { query } from '../../utils/db.mjs';

/**
 * ดึง comments ทั้งหมด (สำหรับ admin)
 * @route   GET /api/admin/comments
 * @desc    ดึง comments ทั้งหมดพร้อม filter และ pagination
 * @access  Private (Admin only)
 */
export const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, is_approved, post_id, user_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryText = `
      SELECT 
        c.*,
        u.username,
        u.email,
        u.avatar_url,
        p.title as post_title,
        p.slug as post_slug,
        COUNT(*) OVER() as total_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE 1=1
    `;
    
    const values = [];
    let valueIndex = 1;

    // Filter by approval status
    if (is_approved !== undefined) {
      queryText += ` AND c.is_approved = $${valueIndex}`;
      values.push(is_approved === 'true' || is_approved === true);
      valueIndex++;
    }

    // Filter by post_id
    if (post_id) {
      queryText += ` AND c.post_id = $${valueIndex}`;
      values.push(parseInt(post_id));
      valueIndex++;
    }

    // Filter by user_id
    if (user_id) {
      queryText += ` AND c.user_id = $${valueIndex}`;
      values.push(parseInt(user_id));
      valueIndex++;
    }

    queryText += ` ORDER BY c.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await query(queryText, values);
    const total = result.rows[0]?.total_count || 0;

    res.json({
      status: 'success',
      data: {
        comments: result.rows.map(comment => ({
          ...comment,
          total_count: undefined
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          total_pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

/**
 * Approve comment
 * @route   PUT /api/admin/comments/:id/approve
 * @desc    อนุมัติ comment
 * @access  Private (Admin only)
 */
export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE comments SET is_approved = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Comment approved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve comment',
      error: error.message
    });
  }
};

/**
 * Reject comment (set is_approved to false)
 * @route   PUT /api/admin/comments/:id/reject
 * @desc    ไม่อนุมัติ comment
 * @access  Private (Admin only)
 */
export const rejectComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE comments SET is_approved = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Comment rejected successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject comment',
      error: error.message
    });
  }
};

/**
 * Delete comment (admin only)
 * @route   DELETE /api/admin/comments/:id
 * @desc    ลบ comment (admin สามารถลบได้ทุก comment)
 * @access  Private (Admin only)
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

/**
 * Get comment statistics
 * @route   GET /api/admin/comments/stats
 * @desc    ดึงสถิติ comments (จำนวนทั้งหมด, อนุมัติแล้ว, รออนุมัติ)
 * @access  Private (Admin only)
 */
export const getCommentStats = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_approved = true) as approved,
        COUNT(*) FILTER (WHERE is_approved = false) as pending
      FROM comments
    `);

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch comment statistics',
      error: error.message
    });
  }
};

