process.env.NODE_ENV='test';
require('dotenv').config({quiet:true});
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {SMTPServer}=require('smtp-server');
const nodemailer=require('nodemailer');
const request=require('supertest');
const {db,User,MailEvent}=require('../src/models');
const mailer=require('../src/services/mailer');
const {hashPassword}=require('../src/security/password');
let smtp,transport,user;const messages=[];
before(async()=>{
 await db.authenticate();await User.destroy({where:{email:'mail-test@example.com'}});
 user=await User.create({name:'Alumno <demo>',email:'mail-test@example.com',password_hash:await hashPassword('Una frase de prueba 2026!')});
 smtp=new SMTPServer({disabledCommands:['AUTH','STARTTLS'],onData(stream,session,done){let raw='';stream.on('data',chunk=>raw+=chunk.toString());stream.on('end',()=>{messages.push({raw,to:session.envelope.rcptTo.map(x=>x.address)});done();});}});
 await new Promise(r=>smtp.listen(0,'127.0.0.1',r));
 transport=nodemailer.createTransport({host:'127.0.0.1',port:smtp.server.address().port,secure:false,ignoreTLS:true});
});
after(async()=>{transport.close();await new Promise(r=>smtp.close(r));await User.destroy({where:{id:user.id}});await db.close();});
test('SMTP de prueba recibe bienvenida y alerta en el correo de la base',async()=>{
 for(const kind of ['welcome','login']){const event=await mailer.queue(user,kind);assert.ok(await mailer.deliver(event.id,{mode:'smtp',transport}));await event.reload();assert.equal(event.status,'sent');assert.ok(event.sent_at);}
 assert.equal(messages.length,2);for(const message of messages){assert.deepEqual(message.to,['mail-test@example.com']);assert.match(message.raw,/multipart\/alternative/);assert.doesNotMatch(message.raw,/Una frase de prueba/);}
});
test('plantillas escapan HTML y tienen contenido distinto',async()=>{
 const event=await mailer.queue(user,'welcome');const welcome=mailer.messageFor(event);assert.match(welcome.html,/&lt;demo&gt;/);assert.match(welcome.subject,/Bienvenido/);
 const login=mailer.messageFor({...event.get(),kind:'login'});assert.match(login.subject,/inicio de sesión/);assert.match(login.text,/Si no reconoces/);
});
test('fallo SMTP conserva evento; reintento exitoso no duplica envío',async()=>{
 const event=await mailer.queue(user,'login');const failure={mode:'smtp',transport:{sendMail:async()=>{throw Object.assign(new Error('sensitive information'),{code:'EAUTH'});}}};
 assert.equal(await mailer.deliver(event.id,failure),false);await event.reload();assert.equal(event.status,'failed');assert.equal(event.last_error,'EAUTH');assert.equal(event.attempts,1);
 const before=messages.length;assert.ok(await mailer.deliver(event.id,{mode:'smtp',transport}));assert.equal(await mailer.deliver(event.id,{mode:'smtp',transport}),false);assert.equal(messages.length,before+1);
});
test('preview genera EML local y nunca se marca como enviado',async()=>{
 const event=await mailer.queue(user,'welcome');const preview=nodemailer.createTransport({streamTransport:true,buffer:true});
 assert.ok(await mailer.deliver(event.id,{mode:'preview',transport:preview}));await event.reload();assert.equal(event.status,'preview');assert.equal(event.sent_at,null);
 const content=await fs.readFile('var/mail-preview/'+event.id+'.eml','utf8');assert.match(content,/To: mail-test@example.com/);
});
test('SMTP rechazado no bloquea registro/login; las credenciales erróneas no generan alertas',async()=>{
 const prev={};for(const key of ['MAIL_MODE','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD','SMTP_SECURE'])prev[key]=process.env[key];
 Object.assign(process.env,{MAIL_MODE:'smtp',SMTP_HOST:'127.0.0.1',SMTP_PORT:'1',SMTP_USER:'test',SMTP_PASSWORD:'test',SMTP_SECURE:'false'});
 const app=require('../src/app')();const agent=request.agent(app);const token=r=>r.text.match(/name="_csrf" value="([a-f0-9]+)"/)[1];
 try{
 await User.destroy({where:{email:'outage@example.com'}});
 let page=await agent.get('/register');let response=await agent.post('/register').type('form').send({_csrf:token(page),name:'Outage test',email:'outage@example.com',password:'Una frase de prueba 2026!',password_confirmation:'Una frase de prueba 2026!'});assert.equal(response.status,303);assert.equal((await agent.get('/dashboard')).status,200);
 let events=await MailEvent.findAll({where:{recipient:'outage@example.com'}});assert.equal(events.length,1);assert.equal(events[0].kind,'welcome');assert.equal(events[0].status,'failed');
 page=await agent.get('/dashboard');await agent.post('/logout').type('form').send({_csrf:token(page)});
 page=await agent.get('/login');response=await agent.post('/login').type('form').send({_csrf:token(page),email:'outage@example.com',password:'wrong'});assert.equal(response.status,401);assert.equal(await MailEvent.count({where:{recipient:'outage@example.com'}}),1);
 response=await agent.post('/login').type('form').send({_csrf:token(page),email:'outage@example.com',password:'Una frase de prueba 2026!'});assert.equal(response.status,303);events=await MailEvent.findAll({where:{recipient:'outage@example.com',kind:'login'}});assert.equal(events.length,1);assert.equal(events[0].status,'failed');
 }finally{app.locals.sessionStore.stopExpiringSessions();for(const[key,value]of Object.entries(prev)){if(value===undefined)delete process.env[key];else process.env[key]=value;}await User.destroy({where:{email:'outage@example.com'}});}
});
