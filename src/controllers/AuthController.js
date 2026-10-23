const { User } = require('../models');
const { hashPassword, verifyPassword, dummy } = require('../security/password');
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const field = (body, key) => typeof body[key] === 'string' ? body[key] : '';
const renderForm = (res, mode, errors = [], values = {}, status = 200) => res.status(status).render('auth', { title: mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión', mode, errors, values });
const regenerate = req => new Promise((resolve, reject) => req.session.regenerate(e => e ? reject(e) : resolve()));
const save = req => new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
async function signIn(req, user) {
 await regenerate(req); req.session.userId = user.id; req.session.authenticatedAt = new Date().toISOString(); await save(req);
}
module.exports = {
 registerForm(req,res) { return renderForm(res,'register'); },
 loginForm(req,res) { return renderForm(res,'login', req.query.required ? ['Inicia sesión para acceder al dashboard.'] : []); },
 async register(req,res) {
  const name = field(req.body,'name').trim(), email = field(req.body,'email').trim().toLowerCase();
  const password = field(req.body,'password'), confirmation = field(req.body,'password_confirmation');
  const errors = [];
  if (name.length < 2 || name.length > 100) errors.push('El nombre debe tener de 2 a 100 caracteres.');
  if (email.length > 254 || !emailPattern.test(email)) errors.push('Escribe un correo válido.');
  if (password.length < 12 || password.length > 128) errors.push('Usa una contraseña de 12 a 128 caracteres.');
  if (password !== confirmation) errors.push('Las contraseñas no coinciden.');
  if (errors.length) return renderForm(res,'register',errors,{name,email},422);
  let user;
  try { user = await User.create({name,email,password_hash:await hashPassword(password)}); }
  catch(e) { if(e.name === 'SequelizeUniqueConstraintError') return renderForm(res,'register',['No se pudo crear la cuenta con ese correo. Intenta iniciar sesión.'],{name,email},422); throw e; }
  await signIn(req,user);
  return res.redirect(303,'/dashboard');
 },
 async login(req,res) {
  const email = field(req.body,'email').trim().toLowerCase(), password = field(req.body,'password');
  if (email.length > 254 || password.length > 128) return renderForm(res,'login',['Correo o contraseña incorrectos.'],{},401);
  const user = await User.scope('withPassword').findOne({where:{email}});
  const valid = await verifyPassword(password,user?.password_hash || dummy);
  if (!user || !valid) return renderForm(res,'login',['Correo o contraseña incorrectos.'],{email},401);
  await signIn(req,user);
  return res.redirect(303,'/dashboard');
 },
 logout(req,res,next) { req.session.destroy(e => { if(e) return next(e); res.clearCookie('activity9.sid',{path:'/'}); res.redirect(303,'/'); }); }
};
