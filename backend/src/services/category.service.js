const categoryRepository = require('../repositories/category.repository');
const { NotFoundError, ConflictError } = require('../errors/AppError');

class CategoryService {
  /**
   * Generates a URL-friendly slug from category name.
   * @param {string} name 
   * @returns {string}
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Lists all categories flat.
   */
  async getAllCategories() {
    return categoryRepository.findAll();
  }

  /**
   * Returns category hierarchy tree.
   */
  async getCategoryTree() {
    return categoryRepository.getTree();
  }

  /**
   * Retrieves category by ID.
   * @param {number|string} categoryId 
   */
  async getCategoryById(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
    }
    return category;
  }

  /**
   * Creates a new category.
   * @param {object} data 
   */
  async createCategory({ name, parent_id = null }) {
    if (parent_id) {
      const parent = await categoryRepository.findById(parent_id);
      if (!parent) {
        throw new NotFoundError('Parent category not found', 'PARENT_CATEGORY_NOT_FOUND');
      }
    }

    let slug = this.generateSlug(name);
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return categoryRepository.create({
      name,
      slug,
      parentId: parent_id
    });
  }
}

module.exports = new CategoryService();
