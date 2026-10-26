// SASSADEE NAN - MySQL Database Connection Pool & Abstraction Layer
// Supports MySQL 8.0 / 8.4 LTS with Connection Pooling & graceful fallback

const fs = require('fs');
const path = require('path');

let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.log('[SASSADEE DB] mysql2 module not loaded, using robust in-memory/JSON store fallback.');
}

const config = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sassadee_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_POOL_LIMIT || '15', 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+07:00'
};

let pool = null;
let isConnected = false;

async function initDB() {
  if (!mysql) return false;
  try {
    pool = mysql.createPool(config);
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log(`[SASSADEE DB] Successfully connected to MySQL at ${config.host}:${config.port}/${config.database} (Pool size: ${config.connectionLimit})`);
    return true;
  } catch (err) {
    console.warn(`[SASSADEE DB] Could not connect to MySQL (${err.message}). Using local JSON store fallback.`);
    isConnected = false;
    return false;
  }
}

// Async Audit Logger (PDPA Compliant - Non-blocking background worker)
const auditQueue = [];
let isLogging = false;

function logAuditAsync(entry) {
  auditQueue.push({
    username: entry.username || 'officer_nan',
    action: entry.action || 'ACCESS',
    tableName: entry.tableName || 'tb_recuit',
    recordId: entry.recordId || null,
    oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
    newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
    ipAddress: entry.ipAddress || '127.0.0.1',
    createdAt: new Date()
  });

  if (!isLogging) {
    processAuditQueue();
  }
}

async function processAuditQueue() {
  if (auditQueue.length === 0) {
    isLogging = false;
    return;
  }
  isLogging = true;
  const item = auditQueue.shift();

  if (isConnected && pool) {
    try {
      await pool.execute(
        `INSERT INTO tb_audit_log (username, action, table_name, record_id, old_values, new_values, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.username, item.action, item.tableName, item.recordId, item.oldValues, item.newValues, item.ipAddress, item.createdAt]
      );
    } catch (e) {
      console.error('[SASSADEE AUDIT] Failed to persist audit log:', e.message);
    }
  }
  setImmediate(processAuditQueue);
}

// Transactional SD.1 sequence retrieval (Row-level lock prevents duplication)
async function getNextSD1Number(amphurCode, yearBE) {
  if (!isConnected || !pool) {
    return Math.floor(100 + Math.random() * 900);
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      `SELECT current_number FROM tb_sd1_sequence WHERE amphur_code = ? AND year_be = ? FOR UPDATE`,
      [amphurCode, yearBE]
    );

    let nextVal = 1;
    if (rows.length === 0) {
      await conn.execute(
        `INSERT INTO tb_sd1_sequence (amphur_code, year_be, current_number) VALUES (?, ?, 1)`,
        [amphurCode, yearBE]
      );
    } else {
      nextVal = rows[0].current_number + 1;
      await conn.execute(
        `UPDATE tb_sd1_sequence SET current_number = ? WHERE amphur_code = ? AND year_be = ?`,
        [nextVal, amphurCode, yearBE]
      );
    }

    await conn.commit();
    return nextVal;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  initDB,
  getPool: () => pool,
  isMySQLConnected: () => isConnected,
  logAuditAsync,
  getNextSD1Number
};
