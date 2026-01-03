import { query } from '../utils/db.mjs';
import cache from '../utils/cache.mjs';

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    
    // Invalidate categories cache when new category is created
    await cache.invalidateCache(['categories:*']);
    
    res.status(201).json({
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

export const getAllCategories = async (req, res) => {
  try {
    const cacheKey = 'categories:all';
    
    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Fetch from database
    const result = await query('SELECT * FROM categories ORDER BY name');
    const response = {
      status: 'success',
      data: result.rows
    };
    
    // Cache for 1 hour (3600 seconds)
    await cache.set(cacheKey, response, 3600);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const cacheKey = `categories:${req.params.id}`;
    
    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const result = await query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    const response = {
      status: 'success',
      data: result.rows[0]
    };
    
    // Cache for 1 hour
    await cache.set(cacheKey, response, 3600);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Invalidate cache when category is updated
    await cache.invalidateCache([`categories:${req.params.id}`, 'categories:*']);
    
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

export const deleteCategory = async (req, res) => {
  try {
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    // Invalidate cache when category is deleted
    await cache.invalidateCache([`categories:${req.params.id}`, 'categories:*']);
    
    res.json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getCategoryPosts = async (req, res) => {
  try {
    const result = await query(
      'SELECT p.* FROM posts p JOIN post_categories pc ON p.id = pc.post_id WHERE pc.category_id = $1',
      [req.params.id]
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