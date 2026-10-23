process.env.NODE_ENV = 'test';
require('dotenv').config({quiet:true});
const {test,before,after} = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const {db,User} = require('../src/models');
const {verifyPassword} = require('../src/security/password');
const createApp = require('../src/app');
let app, agent;
const password='Una frase de prueba 2026!';
const token=res=>res.text.match(/name="_csrf" value="([a-f0-9]+)"/)[1];
before(async()=>{await db.authenticate();await User.destroy({where:{}});app=createApp();agent=request.agent(app);});
after(async()=>{app.locals.sessionStore.stopExpiringSessions();await db.close();});
test('visitante: landingpage, navbar y dashboard protegido',async()=>{
 const landing=await agent.get('/');assert.equal(landing.status,200);assert.match(landing.text,/LANDINGPAGE/);assert.match(landing.text,/href="\/login"/);assert.doesNotMatch(landing.text,/href="\/dashboard"/);
 const protectedView=await agent.get('/dashboard');assert.equal(protectedView.status,303);assert.equal(protectedView.headers.location,'/login?required=1');
 for(const route of ['/register','/login']) assert.equal((await agent.get(route)).status,200);
});
test('rechaza CSRF, correo inválido y contraseñas cortas',async()=>{
 assert.equal((await agent.post('/register').send('name=x')).status,403);
 const page=await agent.get('/register');const res=await agent.post('/register').type('form').send({_csrf:token(page),name:'Ana',email:'invalido',password:'123',password_confirmation:'123'});
 assert.equal(res.status,422);assert.equal(await User.count(),0);
});
test('registro: hash, redirección, cookie, regeneración y navbar autenticada',async()=>{
 const page=await agent.get('/register');const oldSession=page.headers['set-cookie']?.[0];
 const res=await agent.post('/register').type('form').send({_csrf:token(page),name:'Ana <script>alert(1)</script>',email:'ANA@example.com',password,password_confirmation:password});
 assert.equal(res.status,303);assert.equal(res.headers.location,'/dashboard');
 assert.match(res.headers['set-cookie'][0],/HttpOnly/);assert.match(res.headers['set-cookie'][0],/SameSite=Lax/);assert.notEqual(res.headers['set-cookie'][0],oldSession);
 const user=await User.scope('withPassword').findOne({where:{email:'ana@example.com'}});assert.notEqual(user.password_hash,password);assert.ok(await verifyPassword(password,user.password_hash));assert.equal((await User.findByPk(user.id)).password_hash,undefined);
 const dash=await agent.get('/dashboard');assert.equal(dash.status,200);assert.match(dash.text,/DASHBOARD \/ PRIVADO/);assert.match(dash.text,/&lt;script&gt;/);assert.doesNotMatch(dash.text,/<script>alert/);assert.doesNotMatch(dash.text,/href="\/login"/);assert.equal(dash.headers['cache-control'],'no-store');assert.ok(dash.headers['content-security-policy']);
 assert.equal((await agent.get('/')).headers.location,'/dashboard');assert.equal((await agent.get('/register')).headers.location,'/dashboard');
});
test('logout invalida sesión y bloquea volver con cookie antigua',async()=>{
 const page=await agent.get('/dashboard');const cookie=page.headers['set-cookie'][0].split(';')[0];
 assert.equal((await agent.get('/logout')).status,404);
 assert.equal((await agent.post('/logout').type('form').send({_csrf:token(page)})).status,303);
 assert.equal((await agent.get('/dashboard')).status,303);
 assert.equal((await request(app).get('/dashboard').set('Cookie',cookie)).status,303);
});
test('errores de login no distinguen usuario inexistente de contraseña incorrecta',async()=>{
 const page=await agent.get('/login');
 for(const email of ['missing@example.com','ana@example.com']){
 const res=await agent.post('/login').type('form').send({_csrf:token(page),email,password:'incorrecta'});assert.equal(res.status,401);assert.match(res.text,/Correo o contraseña incorrectos/);
 }
 assert.equal((await agent.get('/dashboard')).status,303);
});
test('login correcto y sesión persistida en MySQL',async()=>{
 const page=await agent.get('/login');const result=await agent.post('/login').type('form').send({_csrf:token(page),email:'ana@example.com',password});assert.equal(result.status,303);
 assert.equal((await agent.get('/dashboard')).status,200);
 const [rows]=await db.query('SELECT data FROM Sessions WHERE data LIKE :pattern',{replacements:{pattern:'%userId%'}});assert.ok(rows.length>0);
});
test('correo duplicado no crea segunda cuenta',async()=>{
 const other=request.agent(app);const page=await other.get('/register');const result=await other.post('/register').type('form').send({_csrf:token(page),name:'Ana',email:'ana@example.com',password,password_confirmation:password});assert.equal(result.status,422);assert.equal(await User.count(),1);
});
test('limita intentos repetidos',async()=>{
 let result;const other=request.agent(app);const page=await other.get('/login');
 for(let i=0;i<21;i++) result=await other.post('/login').type('form').send({_csrf:token(page),email:'too-long@example.com',password:'a'.repeat(129)});
 assert.equal(result.status,429);
});
