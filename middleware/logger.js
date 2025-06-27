const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.user ? req.user.id : 'anonymous';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - User: ${user} - ${duration}ms`);
  });

  next();
};

module.exports = logger;