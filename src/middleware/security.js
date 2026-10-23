const { randomBytes, timingSafeEqual } = require('node:crypto');
const { User } = require('../models');
function csrf(req, res, next) {
 if (!req.session.csrf) req.session.csrf = randomBytes(32).toString('hex');
 res.locals.csrf = req.session.csrf;
 if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
  const value = typeof req.body?._csrf === 'string' ? req.body._csrf : '';
  const a = Buffer.from(value), b = Buffer.from(req.session.csrf);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(403).render('error', { title: 'Solicitud rechazada', message: 'El formulario expiró o no es válido. Recarga la página e inténtalo de nuevo.' });
 }
 next();
}
async function currentUser(req, res, next) {
 req.user = req.session.userId ? await User.findByPk(req.session.userId) : null;
 res.locals.user = req.user;
 next();
}
function requireAuth(req, res, next) {
 if (!req.user) return res.redirect(303, '/login?required=1');
 next();
}
function guestOnly(req, res, next) { if (req.user) return res.redirect(303, '/dashboard'); next(); }
module.exports = { csrf, currentUser, requireAuth, guestOnly };
