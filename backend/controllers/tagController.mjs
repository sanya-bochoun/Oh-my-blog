import { query } from '../utils/db.mjs';
import slugify from 'slugify';

export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Tag name is required'
      });
    }
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    const result = await query(
      'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING *',
      [name.trim(), slug]
    );
    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    // Handle duplicate slug or name
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        status: 'error',
        message: 'Tag with this name or slug already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const result = await query('SELECT * FROM tags ORDER BY name');
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getTagById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM tags WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Tag name is required'
      });
    }
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    const result = await query(
      'UPDATE tags SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
      [name.trim(), slug, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    // Handle duplicate slug or name
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        status: 'error',
        message: 'Tag with this name or slug already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const result = await query('DELETE FROM tags WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }
    res.json({
      status: 'success',
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getTagPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await query(
      `SELECT 
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar,
        c.name as category_name,
        COUNT(*) OVER() as total_count
      FROM posts p 
      JOIN post_tags pt ON p.id = pt.post_id 
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pt.tag_id = $1 AND p.published = true
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.params.id, parseInt(limit), offset]
    );
    
    const total = result.rows[0]?.total_count || 0;
    
    res.json({
      status: 'success',
      data: {
        posts: result.rows.map(post => ({
          ...post,
          thumbnail_url: post.thumbnail_url || post.featured_image || null,
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
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get tag by slug
export const getTagBySlug = async (req, res) => {
  try {
    const result = await query('SELECT * FROM tags WHERE slug = $1', [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Tag not found'
      });
    }
    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get popular tags (tags with most posts)
export const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await query(
      `SELECT 
        t.*,
        COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.published = true
      GROUP BY t.id
      HAVING COUNT(pt.post_id) > 0
      ORDER BY post_count DESC, t.name ASC
      LIMIT $1`,
      [parseInt(limit)]
    );
    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 