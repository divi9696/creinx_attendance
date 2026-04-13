const db = require('../config/db');

class Announcement {
  static async create(title, message, createdBy) {
    const query = `
      INSERT INTO announcements (title, message, created_by, created_at, status)
      VALUES (?, ?, ?, NOW(), 'active')
    `;
    const [result] = await db.query(query, [title, message, createdBy]);
    return { id: result.insertId, title, message, createdBy };
  }

  static async getAll(limit = 50) {
    const query = `
      SELECT id, title, message, created_by, created_at, status
      FROM announcements
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const [results] = await db.query(query, [limit]);
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
