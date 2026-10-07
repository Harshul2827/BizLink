const pool = require('../db');

/**
 * Repository handling database operations for categories.
 */
class CategoryRepository {
  /**
   * Retrieves all categories.
   * @returns {Promise<Array>}
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT category_id, parent_id, name, slug
       FROM categories
       ORDER BY parent_id IS NOT NULL, name ASC`
    );
    return rows;
  }

  /**
   * Finds a category by its primary key ID.
   * @param {number|string} categoryId 
   * @returns {Promise<object|null>}
   */
  async findById(categoryId) {
    const [rows] = await pool.query(
      `SELECT c.category_id, c.parent_id, c.name, c.slug, p.name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.category_id
       WHERE c.category_id = ?`,
      [categoryId]
    );
    return rows[0] || null;
  }

  /**
   * Finds a category by its unique slug.
   * @param {string} slug 
   * @returns {Promise<object|null>}
   */
  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT c.category_id, c.parent_id, c.name, c.slug, p.name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.category_id
       WHERE c.slug = ?`,
      [slug]
    );
    return rows[0] || null;
  }

  /**
   * Creates a new category.
   * @param {object} param0 
   * @returns {Promise<object>}
   */
  async create({ name, slug, parentId = null }) {
    const [result] = await pool.query(
      `INSERT INTO categories (name, slug, parent_id)
       VALUES (?, ?, ?)`,
      [name, slug, parentId]
    );

    return {
      category_id: result.insertId,
      name,
      slug,
      parent_id: parentId
    };
  }

  /**
   * Retrieves categories in a hierarchical nested tree.
   * @returns {Promise<Array>}
   */
  async getTree() {
    const categories = await this.findAll();
    const map = {};
    const tree = [];

    categories.forEach(cat => {
      map[cat.category_id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.category_id]);
      } else {
        tree.push(map[cat.category_id]);
      }
    });

    return tree;
  }
}

module.exports = new CategoryRepository();
