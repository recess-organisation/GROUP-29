function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }

  if (err.message?.includes('Unsupported file type')) {
    return res.status(400).json({ message: 'Unsupported file type.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: status === 500
      ? 'An unexpected error occurred.'
      : err.message || 'An unexpected error occurred.'
  });
}

module.exports = errorHandler;
