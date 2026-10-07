const pool = require('../db');

class DiscoveryRepository {
  /**
   * Search businesses with multiple filters and pagination.
   * Only returns ACTIVE or VERIFIED businesses.
   */
  async searchBusinesses(filters) {
    const {
      search,
      categoryId,
      city,
      state,
      country,
      status,
      hasServices,
      hasNeeds,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = filters;

    const conditions = ["b.status IN ('ACTIVE', 'VERIFIED')"];
    const params = [];

    if (search) {
      conditions.push('(b.name LIKE ? OR b.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      conditions.push('b.primary_category_id = ?');
      params.push(categoryId);
    }

    if (city) {
      conditions.push('b.city LIKE ?');
      params.push(`%${city}%`);
    }

    if (state) {
      conditions.push('b.state LIKE ?');
      params.push(`%${state}%`);
    }

    if (country) {
      conditions.push('b.country LIKE ?');
      params.push(`%${country}%`);
    }

    if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (hasServices) {
      conditions.push('EXISTS (SELECT 1 FROM services s WHERE s.business_id = b.business_id AND s.status = \'ACTIVE\')');
    }

    if (hasNeeds) {
      conditions.push('EXISTS (SELECT 1 FROM needs n WHERE n.business_id = b.business_id)');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query for pagination
    const countSql = `
      SELECT COUNT(*) AS total 
      FROM businesses b
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // Allowed sort columns
    const allowedSortCols = {
      name: 'b.name',
      created_at: 'b.created_at',
      status: 'b.status'
    };
    const sortCol = allowedSortCols[sortBy] || 'b.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT 
        b.business_id,
        b.owner_user_id,
        b.primary_category_id,
        c.name AS category_name,
        b.name,
        b.slug,
        b.description,
        b.city,
        b.state,
        b.country,
        b.status,
        b.created_at,
        (SELECT COUNT(*) FROM services s WHERE s.business_id = b.business_id AND s.status = 'ACTIVE') AS service_count,
        (SELECT COUNT(*) FROM needs n WHERE n.business_id = b.business_id) AS need_count
      FROM businesses b
      LEFT JOIN categories c ON b.primary_category_id = c.category_id
      ${whereClause}
      ORDER BY ${sortCol} ${direction}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Search active services across businesses.
   */
  async searchServices(filters) {
    const {
      search,
      categoryId,
      businessId,
      minPrice,
      maxPrice,
      city,
      state,
      sortBy = 'title',
      sortOrder = 'ASC',
      page = 1,
      limit = 20
    } = filters;

    const conditions = ["s.status = 'ACTIVE'", "b.status IN ('ACTIVE', 'VERIFIED')"];
    const params = [];

    if (search) {
      conditions.push('(s.title LIKE ? OR b.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      conditions.push('s.category_id = ?');
      params.push(categoryId);
    }

    if (businessId) {
      conditions.push('s.business_id = ?');
      params.push(businessId);
    }

    if (minPrice !== undefined) {
      conditions.push('s.price_max >= ?');
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      conditions.push('s.price_min <= ?');
      params.push(maxPrice);
    }

    if (city) {
      conditions.push('b.city LIKE ?');
      params.push(`%${city}%`);
    }

    if (state) {
      conditions.push('b.state LIKE ?');
      params.push(`%${state}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM services s
      JOIN businesses b ON s.business_id = b.business_id
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const allowedSortCols = {
      price_min: 's.price_min',
      price_max: 's.price_max',
      title: 's.title',
      created_at: 's.service_id'
    };
    const sortCol = allowedSortCols[sortBy] || 's.title';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT 
        s.service_id,
        s.business_id,
        s.category_id,
        c.name AS category_name,
        s.title,
        s.price_min,
        s.price_max,
        s.status,
        b.name AS business_name,
        b.slug AS business_slug,
        b.city AS business_city,
        b.state AS business_state,
        b.status AS business_status
      FROM services s
      JOIN businesses b ON s.business_id = b.business_id
      LEFT JOIN categories c ON s.category_id = c.category_id
      ${whereClause}
      ORDER BY ${sortCol} ${direction}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Search active business needs across businesses.
   */
  async searchNeeds(filters) {
    const {
      search,
      categoryId,
      businessId,
      minBudget,
      maxBudget,
      deadlineBefore,
      city,
      state,
      sortBy = 'deadline',
      sortOrder = 'ASC',
      page = 1,
      limit = 20
    } = filters;

    const conditions = ["b.status IN ('ACTIVE', 'VERIFIED')"];
    const params = [];

    if (search) {
      conditions.push('(n.title LIKE ? OR b.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      conditions.push('n.category_id = ?');
      params.push(categoryId);
    }

    if (businessId) {
      conditions.push('n.business_id = ?');
      params.push(businessId);
    }

    if (minBudget !== undefined) {
      conditions.push('n.budget_max >= ?');
      params.push(minBudget);
    }

    if (maxBudget !== undefined) {
      conditions.push('n.budget_min <= ?');
      params.push(maxBudget);
    }

    if (deadlineBefore) {
      conditions.push('n.deadline <= ?');
      params.push(deadlineBefore);
    }

    if (city) {
      conditions.push('b.city LIKE ?');
      params.push(`%${city}%`);
    }

    if (state) {
      conditions.push('b.state LIKE ?');
      params.push(`%${state}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM needs n
      JOIN businesses b ON n.business_id = b.business_id
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const allowedSortCols = {
      budget_min: 'n.budget_min',
      budget_max: 'n.budget_max',
      deadline: 'n.deadline',
      title: 'n.title'
    };
    const sortCol = allowedSortCols[sortBy] || 'n.deadline';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT 
        n.need_id,
        n.business_id,
        n.category_id,
        c.name AS category_name,
        n.title,
        n.budget_min,
        n.budget_max,
        n.deadline,
        b.name AS business_name,
        b.slug AS business_slug,
        b.city AS business_city,
        b.state AS business_state,
        b.status AS business_status
      FROM needs n
      JOIN businesses b ON n.business_id = b.business_id
      LEFT JOIN categories c ON n.category_id = c.category_id
      ${whereClause}
      ORDER BY ${sortCol} ${direction}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new DiscoveryRepository();
