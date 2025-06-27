const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;