// ===================================
// PHARMACEUTICAL PROCUREMENT SYSTEM
// SERVER.JS - REST API Server
// ===================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import pharmaceutical-specific routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const drugRoutes = require('./routes/drugRoutes');
const drugCategoryRoutes = require('./routes/drugCategoryRoutes');
const drugManufacturerRoutes = require('./routes/drugManufacturerRoutes');
const purchaseRequestRoutes = require('./routes/purchaseRequestRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const contractRoutes = require('./routes/contractRoutes');
const receivingRoutes = require('./routes/receivingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const qualityControlRoutes = require('./routes/qualityControlRoutes');
const regulatoryRoutes = require('./routes/regulatoryRoutes');
const expiryTrackingRoutes = require('./routes/expiryTrackingRoutes');
const batchRoutes = require('./routes/batchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const regulatoryCheck = require('./middleware/regulatoryCheck');

// Import services
const ExpiryAlertService = require('./services/ExpiryAlertService');
const RegulatoryService = require('./services/RegulatoryService');
const LicenseValidationService = require('./services/LicenseValidationService');

const app = express();
const PORT = process.env.PORT_API || 3000;
console.log("PORT_API", PORT);
// ===================================
// SECURITY MIDDLEWARE
// ===================================

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for pharmaceutical applications
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Regulatory-Token', 'X-License-Number']
// }));
// app.use(cors({
//   origin: ['https://http://146.88.62.229:3001/api'],
//   credentials: true,
// }));
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.25.10.18:3000',
    'http://172.25.10.18:3001',
    'http://146.88.62.229:3000',
    'http://146.88.62.229:3001',
    'http://bangna5.com:3000',
    'http://bangna5.com:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
//app.use(cors());
// app.use(cors({
//   origin: '*'
// }));
// Rate limiting with pharmaceutical industry considerations
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More restrictive in production
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for regulatory compliance endpoints
  skip: (req) => {
    return req.path.startsWith('/api/regulatory/emergency') || 
           req.path.startsWith('/api/qc/urgent');
  }
});

app.use('/api/', limiter);

// ===================================
// BODY PARSING MIDDLEWARE
// ===================================

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for regulatory compliance verification
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================
// LOGGING AND MONITORING
// ===================================

// Custom logger for pharmaceutical operations
app.use(logger);

// Regulatory compliance logging
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  // Log all pharmaceutical operations for audit trail
  if (req.path.includes('/api/drugs') || 
      req.path.includes('/api/licenses') || 
      req.path.includes('/api/batches') ||
      req.path.includes('/api/qc')) {
    console.log(`[PHARMA-AUDIT] ${new Date().toISOString()} - ${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'} - IP: ${req.ip}`);
  }
  next();
});

// ===================================
// STATIC FILES AND UPLOADS
// ===================================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve regulatory documents (with authentication)
app.use('/regulatory', express.static(path.join(__dirname, 'regulatory'), {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// ===================================
// PHARMACEUTICAL API ROUTES
// ===================================

// Authentication routes
app.use('/api/auth', authRoutes);

// User management
app.use('/api/users', userRoutes);

// Vendor and supplier management
//app.use('/api/vendors', vendorRoutes);
app.use('/api', vendorRoutes);

// Drug and pharmaceutical product management
app.use('/api/drugs', drugRoutes);
app.use('/api/drug-categories', drugCategoryRoutes);
app.use('/api/manufacturers', drugManufacturerRoutes);

// Procurement process
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/receiving', receivingRoutes);
app.use('/api/payments', paymentRoutes);

// Inventory and warehouse management
app.use('/api/inventory', inventoryRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/expiry-tracking', expiryTrackingRoutes);

// Regulatory and compliance
app.use('/api/licenses', licenseRoutes);
app.use('/api/regulatory', regulatoryRoutes);
app.use('/api/quality-control', qualityControlRoutes);

// Reports and analytics
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ===================================
// HEALTH CHECK AND SYSTEM STATUS
// ===================================

app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    const db = require('./config/database');
    await db.execute('SELECT 1');

    // Check regulatory service status
    const regulatoryStatus = await RegulatoryService.getSystemStatus();
    
    // Check license validation service
    const licenseStatus = await LicenseValidationService.getServiceStatus();

    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: require('./package.json').version,
      environment: process.env.NODE_ENV,
      services: {
        database: 'connected',
        regulatory: regulatoryStatus,
        licensing: licenseStatus
      },
      compliance: {
        fdaLicense: process.env.FDA_LICENSE_NO || 'Not configured',
        whoGmp: process.env.WHO_GMP_CERT || 'Not configured',
        isoCert: process.env.ISO_CERT_NO || 'Not configured'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
      message: process.env.NODE_ENV === 'development' ? error.message : 'System maintenance'
    });
  }
});
console.log("aaaaaaaaaaaaaaaaaa");
// System information endpoint for authorized users
app.get('/api/system/info', (req, res) => {
  res.json({
    application: 'Pharmaceutical Procurement System',
    version: require('./package.json').version,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    features: {
      batchTracking: process.env.ENABLE_BATCH_TRACKING === 'true',
      expiryAlerts: process.env.ENABLE_EXPIRY_ALERTS === 'true',
      temperatureMonitoring: process.env.ENABLE_TEMPERATURE_MONITORING === 'true',
      coldChain: process.env.COLD_CHAIN_REQUIRED === 'true',
      autoReorder: process.env.AUTO_REORDER_ENABLED === 'true',
      qrCodeEnabled: process.env.QR_CODE_ENABLED === 'true'
    }
  });
});

// Compliance status endpoint
app.get('/api/compliance/status', async (req, res) => {
  try {
    const complianceStatus = await RegulatoryService.getComplianceStatus();
    res.json(complianceStatus);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get compliance status',
      message: error.message
    });
  }
});
console.log("bbbbbbbbbbbbbbbbbbbbbb");
// ===================================
// BACKGROUND SERVICES
// ===================================

// Start pharmaceutical background services
const startBackgroundServices = () => {
  // Expiry alert service
  if (process.env.ENABLE_EXPIRY_ALERTS === 'true') {
    console.log('🚨 Starting expiry alert service...');
    ExpiryAlertService.start();
  }

  // License validation service
  console.log('📜 Starting license validation service...');
  LicenseValidationService.start();

  // Regulatory compliance checker
  console.log('🏛️ Starting regulatory compliance checker...');
  RegulatoryService.startComplianceMonitoring();

  console.log('✅ All pharmaceutical background services started');
};

// ===================================
// ERROR HANDLING
// ===================================

// Pharmaceutical-specific error handling
app.use((err, req, res, next) => {
  // Log pharmaceutical compliance errors
  if (err.type === 'REGULATORY_VIOLATION' || err.type === 'LICENSE_EXPIRED') {
    console.error(`[REGULATORY-ERROR] ${new Date().toISOString()} - ${err.message} - User: ${req.user?.id} - Path: ${req.path}`);
    
    // Send immediate notification to regulatory team
    if (process.env.REGULATORY_CONTACT) {
      // TODO: Implement emergency notification
    }
  }
  
  next(err);
});
console.log("ccccccccccccccccccccccc");
// Global error handler


// ===================================
// GRACEFUL SHUTDOWN
// ===================================
console.log("c111111111111111111111111111111");
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Stop background services
  ExpiryAlertService.stop();
  LicenseValidationService.stop();
  RegulatoryService.stopComplianceMonitoring();
  
  // Close database connections
  const db = require('./config/database');
  if (db && db.end) {
    db.end();
  }
  
  console.log('✅ Pharmaceutical procurement system shut down gracefully');
  process.exit(0);
};
console.log("dddddddddddddddddddddddddd");
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ===================================
// START SERVER
// ===================================

const server = app.listen(PORT, () => {
  console.log('\n🏥 ===================================');
  console.log('   PHARMACEUTICAL PROCUREMENT API');
  console.log('🏥 ===================================');
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api/system/info`);
  console.log(`📜 Compliance API: http://localhost:${PORT}/api/compliance/status`);
  
  // Display pharmaceutical configuration
  console.log('\n💊 Pharmaceutical Configuration:');
  console.log(`   FDA License: ${process.env.FDA_LICENSE_NO || 'Not configured'}`);
  console.log(`   WHO-GMP Cert: ${process.env.WHO_GMP_CERT || 'Not configured'}`);
  console.log(`   Batch Tracking: ${process.env.ENABLE_BATCH_TRACKING === 'true' ? '✅' : '❌'}`);
  console.log(`   Expiry Alerts: ${process.env.ENABLE_EXPIRY_ALERTS === 'true' ? '✅' : '❌'}`);
  console.log(`   Temperature Monitoring: ${process.env.ENABLE_TEMPERATURE_MONITORING === 'true' ? '✅' : '❌'}`);
  console.log(`   Cold Chain: ${process.env.COLD_CHAIN_REQUIRED === 'true' ? '✅' : '❌'}`);
  
  console.log('\n🔗 API Endpoints:');
  console.log('   • Drug Management: /api/drugs');
  console.log('   • Manufacturers: /api/manufacturers');
  console.log('   • Purchase Requests: /api/purchase-requests');
  console.log('   • Licenses: /api/licenses');
  console.log('   • Quality Control: /api/quality-control');
  console.log('   • Batch Tracking: /api/batches');
  console.log('   • Regulatory: /api/regulatory');
  console.log('   • Inventory: /api/inventory');
  console.log('   • Reports: /api/reports');
  
  console.log('\n✅ Pharmaceutical API server ready!');
  
  // Start background services after server is running
  setTimeout(() => {
    startBackgroundServices();
  }, 2000);
});
app.use(errorHandler);

// 404 handler (ต้องอยู่หลังสุด)
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     message: 'API endpoint not found',
//     path: req.originalUrl,
//     method: req.method,
//     timestamp: new Date().toISOString()
//   });
// });
// Export for testing
module.exports = app;