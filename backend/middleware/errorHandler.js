export function errorHandler(err, _req, res, _next) {
  console.error('[Error Handler]', err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}
