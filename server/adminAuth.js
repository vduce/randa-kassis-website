const crypto = require('crypto');

module.exports = function installAdminAuth(app) {
  const email = process.env.ADMIN_EMAIL || process.env.REACT_APP_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || process.env.REACT_APP_ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(48).toString('hex');
  const duration = 12 * 60 * 60 * 1000;
  const cookieName = 'randa_admin';
  const attempts = new Map();
  const hash = value => crypto.createHash('sha256').update(String(value)).digest();
  const equal = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));
  const sign = value => crypto.createHmac('sha256', secret).update(value).digest('base64url');
  const cookieOptions = req => ({
    httpOnly: true, secure: req.secure || process.env.NODE_ENV === 'production',
    sameSite: 'strict', path: '/',
  });

  function getSession(req) {
    try {
      const cookie = (req.headers.cookie || '').split(';').map(v => v.trim())
        .find(v => v.startsWith(`${cookieName}=`));
      if (!cookie || !email || !password) return null;
      const [payload, signature] = cookie.slice(cookieName.length + 1).split('.');
      if (!payload || !signature || !equal(signature, sign(payload))) return null;
      const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (session.email !== email || session.expiresAt <= Date.now()) return null;
      return { email: session.email, name: 'Admin User' };
    } catch { return null; }
  }

  // A custom header prevents cross-site form submissions, including login CSRF.
  function requireAdminRequest(req, res, next) {
    if (req.get('X-Requested-With') !== 'RandaAdmin') {
      return res.status(403).json({ error: 'Invalid admin request' });
    }
    const origin = req.get('Origin');
    if (origin) {
      const allowed = [process.env.ADMIN_ORIGIN || 'https://dev.randakassis.com'];
      if (process.env.NODE_ENV !== 'production') allowed.push('http://localhost:3000', 'http://localhost:3036');
      if (!allowed.includes(origin)) return res.status(403).json({ error: 'Invalid request origin' });
    }
    next();
  }

  app.use(['/api/admin', '/api/storage', '/metadata/api'], (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.post('/api/admin/login', requireAdminRequest, (req, res) => {
    if (!email || !password) return res.status(503).json({ error: 'Admin login is not configured' });
    const now = Date.now();
    for (const [ip, value] of attempts) if (value.until <= now) attempts.delete(ip);
    const current = attempts.get(req.ip) || { count: 0, until: now + 15 * 60 * 1000 };
    if (current.count >= 10) return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    if (typeof req.body?.email !== 'string' || typeof req.body?.password !== 'string' ||
        !equal(req.body.email, email) || !equal(req.body.password, password)) {
      current.count += 1;
      attempts.set(req.ip, current);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    attempts.delete(req.ip);
    const payload = Buffer.from(JSON.stringify({ email, expiresAt: now + duration,
      nonce: crypto.randomBytes(16).toString('hex') })).toString('base64url');
    res.cookie(cookieName, `${payload}.${sign(payload)}`, { ...cookieOptions(req), maxAge: duration });
    res.json({ success: true, user: { email, name: 'Admin User' } });
  });
  app.get('/api/admin/session', (req, res) => {
    const user = getSession(req);
    if (!user) return res.status(401).json({ error: 'Please log in' });
    res.json({ success: true, user });
  });
  app.post('/api/admin/logout', requireAdminRequest, (req, res) => {
    res.clearCookie(cookieName, cookieOptions(req));
    res.json({ success: true });
  });

  app.use(['/api/storage', '/metadata/api'], (req, res, next) => {
    if (req.path === '/health') return next();
    // Published metadata stays readable; every storage operation and metadata write requires login.
    if (req.baseUrl === '/metadata/api' && req.method === 'GET') return next();
    if (!getSession(req)) return res.status(401).json({ error: 'Please log in' });
    if (!['GET', 'HEAD'].includes(req.method)) return requireAdminRequest(req, res, next);
    next();
  });
};
