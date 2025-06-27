const mysql = require('mysql2/promise');
require('dotenv').config();

// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pharmacy_procurement',
    charset: 'utf8mb4',
    timezone: '+07:00', // Thailand timezone
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // Connection Pool Settings
    connectionLimit: 20,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // Additional MySQL settings
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    debug: process.env.NODE_ENV === 'development' ? false : false,
    multipleStatements: false, // Security: prevent multiple SQL statements
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
};

// Connection Pool
const pool = mysql.createPool(dbConfig);

// Test Database Connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Execute Query with Error Handling
async function executeQuery(query, params = []) {
    try {
        const [rows, fields] = await pool.execute(query, params);
        return [rows, fields];
    } catch (error) {
        console.error('Query Error:', error.message);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    }
}

// Execute Query with Connection (for transactions)
async function executeQueryWithConnection(connection, query, params = []) {
    try {
        const [rows, fields] = await connection.execute(query, params);
        return [rows, fields];
    } catch (error) {
        console.error('Query Error:', error.message);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    }
}

// Get Connection for Transactions
async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Failed to get connection:', error.message);
        throw error;
    }
}

// Transaction Helper
async function withTransaction(callback) {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Database Health Check
async function healthCheck() {
    try {
        const [rows] = await pool.execute('SELECT 1 as health_check');
        return {
            status: 'healthy',
            message: 'Database is responding',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Get Pool Stats
function getPoolStats() {
    return {
        totalConnections: pool.pool._allConnections.length,
        freeConnections: pool.pool._freeConnections.length,
        usedConnections: pool.pool._allConnections.length - pool.pool._freeConnections.length,
        queuedRequests: pool.pool._connectionQueue.length
    };
}

// Close Database Pool
async function closePool() {
    try {
        await pool.end();
        console.log('📊 Database pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error.message);
    }
}

// Graceful Shutdown Handler
process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, closing database connections...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, closing database connections...');
    await closePool();
    process.exit(0);
});

// Database Utilities
const dbUtils = {
    // Format date for MySQL
    formatDate: (date) => {
        if (!date) return null;
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    },

    // Escape like string
    escapeLike: (str) => {
        return str.replace(/[%_\\]/g, '\\$&');
    },

    // Build WHERE clause from filters
    buildWhereClause: (filters, allowedFields = []) => {
        const conditions = [];
        const params = [];

        Object.keys(filters).forEach(key => {
            if (allowedFields.length === 0 || allowedFields.includes(key)) {
                const value = filters[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
                        params.push(...value);
                    } else if (typeof value === 'string' && value.includes('%')) {
                        conditions.push(`${key} LIKE ?`);
                        params.push(value);
                    } else {
                        conditions.push(`${key} = ?`);
                        params.push(value);
                    }
                }
            }
        });

        return {
            whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
            params
        };
    },

    // Pagination helper
    pagination: (page = 1, limit = 10) => {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        return {
            limit: parseInt(limit),
            offset: offset,
            sql: `LIMIT ${parseInt(limit)} OFFSET ${offset}`
        };
    }
};

// Export modules
module.exports = {
    // Main pool for regular queries
    execute: executeQuery,
    query: executeQuery, // Alias for execute
    
    // Connection management
    getConnection,
    pool,
    
    // Transaction helpers
    withTransaction,
    executeQueryWithConnection,
    
    // Utilities
    testConnection,
    healthCheck,
    getPoolStats,
    closePool,
    dbUtils,
    
    // Configuration
    config: dbConfig
};

// Initialize connection test
testConnection();