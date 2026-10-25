const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(scryptCallback);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
async function hashPassword(password) {
 const salt = randomBytes(16).toString('hex');
 const key = await scrypt(password, salt, 64, options);
 return `scrypt$32768$8$3$${salt}$${key.toString('hex')}`;
}
async function verifyPassword(password, stored) {
 const parts = stored.split('$');
 if (parts.length !== 6 || parts.slice(0,4).join('$') !== 'scrypt$32768$8$3') return false;
 const expected = Buffer.from(parts[5], 'hex');
 const actual = await scrypt(password, parts[4], 64, options);
 return expected.length === actual.length && timingSafeEqual(expected, actual);
}
// Used for unknown emails too, so both paths perform a password derivation.
const dummy = 'scrypt$32768$8$3$' + '0'.repeat(32) + '$' + '0'.repeat(128);
module.exports = { hashPassword, verifyPassword, dummy };
