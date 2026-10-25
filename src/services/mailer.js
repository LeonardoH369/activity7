const nodemailer = require('nodemailer');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Op } = require('sequelize');
const { MailEvent } = require('../models');
function transportConfig() {
 const mode=process.env.MAIL_MODE || 'preview';
 if (mode === 'preview') {
  if(process.env.NODE_ENV==='production') throw new Error('MAIL_MODE=preview no se permite en producción.');
  return {mode,transport:nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'})};
 }
 if (mode === 'local') {
  if(process.env.NODE_ENV==='production') throw new Error('El buzón local no se permite en producción.');
  // Deliberately fixed to loopback: unauthenticated SMTP must never target a remote host.
  return {mode,transport:nodemailer.createTransport({host:'127.0.0.1',port:1025,secure:false,ignoreTLS:true,
   connectionTimeout:5000,greetingTimeout:5000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true})};
 }
 if (mode !== 'smtp') throw new Error('MAIL_MODE debe ser preview, local o smtp.');
 for (const key of ['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','MAIL_FROM']) if(!process.env[key]) throw new Error('Falta configurar '+key);
 const secure=process.env.SMTP_SECURE==='true';
 return {mode,transport:nodemailer.createTransport({
  host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||465),secure,requireTLS:!secure,
  auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},
  connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,
  disableFileAccess:true,disableUrlAccess:true
 })};
}
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function messageFor(event){
 const welcome=event.kind==='welcome';
 const title=welcome?'Bienvenido a Activity 9':'Nuevo inicio de sesión en Activity 9';
 const date=new Date(event.createdAt).toLocaleString('es-MX',{timeZone:'America/Monterrey'});
 const explanation=welcome?'Tu cuenta se creó correctamente. Ya puedes acceder a tu dashboard.':'Se detectó un inicio de sesión correcto en tu cuenta.';
 const detail=welcome?'Gracias por registrarte.':'Si no reconoces este acceso, contacta al administrador para proteger tu cuenta. No compartas tu contraseña.';
 return {
  from:process.env.MAIL_FROM||'Activity 9 <no-reply@example.com>',to:event.recipient,
  messageId:`<${event.id}@activity9.local>`,subject:title,
  text:`Hola, ${event.recipient_name}.\n\n${explanation}\nFecha: ${date} (Monterrey).\n\n${detail}\n\nActivity 9`,
  html:`<!doctype html><html lang="es"><body style="font-family:Arial;background:#f5f4ef;padding:32px;color:#192c29"><div style="max-width:600px;margin:auto;background:white;padding:32px;border-top:6px solid #235340"><p>ACTIVITY 9 / CUENTA</p><h1>${title}</h1><p>Hola, ${escapeHtml(event.recipient_name)}.</p><p>${explanation}</p><p><b>Fecha:</b> ${escapeHtml(date)} (Monterrey).</p><p>${detail}</p><hr><small>Notificación automática. Nunca solicitamos contraseñas por correo.</small></div></body></html>`
 };
}
function queue(user,kind,transaction){return MailEvent.create({id:randomUUID(),user_id:user.id,kind,recipient:user.email,recipient_name:user.name},{transaction});}
async function deliver(id,provided){
 const [claimed]=await MailEvent.update({status:'sending',last_error:null},{where:{id,status:{[Op.in]:['pending','failed']},attempts:{[Op.lt]:5}}});
 if(!claimed)return false;
 const event=await MailEvent.findByPk(id);
 await event.increment('attempts');
 try {
  const config=provided||transportConfig();
  const info=await config.transport.sendMail(messageFor(event));
  if(config.mode==='preview'){
   const dir=path.resolve('var/mail-preview');await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,id+'.eml'),info.message,{mode:0o600});
   await event.update({status:'preview',last_error:null});
  }else{
   if(!info.accepted?.some(value=>String(value).toLowerCase()===event.recipient.toLowerCase()))throw Object.assign(new Error('Recipient rejected'),{code:'ERECIPIENT'});
   await event.update({status:'sent',sent_at:new Date(),last_error:null});
  }
  return true;
 } catch(error){
  // Never persist provider error text: it can contain addresses or credentials.
  const code=['EAUTH','ECONNECTION','ETIMEDOUT','ESOCKET','ERECIPIENT'].includes(error.code)?error.code:'MAIL_DELIVERY_FAILED';
  await event.update({status:'failed',last_error:code});console.warn('Email queued for retry:',id,code);return false;
 }
}
async function retryPending(){
 // A crashed worker can leave sending rows. Reclaim only after all SMTP timeouts have elapsed.
 await MailEvent.update({status:'failed',last_error:'INTERRUPTED'},{where:{status:'sending',updatedAt:{[Op.lt]:new Date(Date.now()-5*60*1000)}}});
 const events=await MailEvent.findAll({where:{status:{[Op.in]:['pending','failed']},attempts:{[Op.lt]:5}},order:[['createdAt','ASC']],limit:100});
 for(const event of events)await deliver(event.id);
 return events.length;
}
module.exports={queue,deliver,messageFor,transportConfig,retryPending};
