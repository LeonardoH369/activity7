const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, encoded) {
  const [scheme, salt, hash] = (encoded || '').split('$');
  if (scheme !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/.test(hash || '')) return false;
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64));
}
module.exports = { hashPassword, verifyPassword };
