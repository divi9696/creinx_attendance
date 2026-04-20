const db = require('../config/db');

class Announcement {
  static async create(title, message, createdBy, targetType = 'all', targetGroup = null, targetUserId = null) {
    const query = `
      INSERT INTO announcements (title, message, created_by, created_at, status, target_type, target_group, target_user_id)
      VALUES (?, ?, ?, NOW(), 'active', ?, ?, ?)
    `;
    const [result] = await db.query(query, [title, message, createdBy, targetType, targetGroup, targetUserId]);
    return { id: result.insertId, title, message, createdBy, targetType, targetGroup, targetUserId };
  }

  static async getAll(limit = 50, employee = null) {
    let query = `
      SELECT id, title, message, created_by, created_at, status, target_type, target_group, target_user_id
      FROM announcements
      WHERE status = 'active'
    `;
    
    const params = [];

    if (employee && employee.role !== 'admin') {
      // Filter for employees: show 'all', their specific department, or their specific user ID
      query += ` AND (
        target_type = 'all' 
        OR (target_type = 'department' AND target_group = ?) 
        OR (target_type = 'individual' AND target_user_id = ?)
      )`;
      params.push(employee.department, employee.id);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const [results] = await db.query(query, params);
    return results || [];
  }

  static async getById(id) {
    const query = `
      SELECT id, title, message, created_by, created_at, status
      FROM announcements
      WHERE id = ?
    `;
    const [results] = await db.query(query, [id]);
    return results[0] || null;
  }

  static async update(id, title, message) {
    const query = `
      UPDATE announcements
      SET title = ?, message = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await db.query(query, [title, message, id]);
    return { id, title, message };
  }

  static async delete(id) {
    const query = `
      UPDATE announcements
      SET status = 'deleted'
      WHERE id = ?
    `;
    await db.query(query, [id]);
    return { id };
  }
}

module.exports = Announcement;
