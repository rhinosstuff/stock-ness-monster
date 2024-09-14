function ensureManager(req, res, next) {
  if (req.session.role === 'manager') {
      return next();
  }
  res.status(403).send('Access denied');
}

module.exports = ensureManager;