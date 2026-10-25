require('dotenv').config({quiet:true});
const { db }=require('../src/models');
const { transportConfig,retryPending }=require('../src/services/mailer');
(async()=>{
 if(process.argv[2]==='verify'){
  const {mode,transport}=transportConfig();
  if(mode==='preview')console.log('PREVIEW: solo se generan archivos locales. No se envían correos.');
  else {await transport.verify();console.log(mode==='local'?'SMTP LOCAL verificado. Buzón: http://localhost:8025 (no entrega a Internet).':'Conexión y autenticación SMTP verificadas; falta comprobar recepción en el buzón.');}
 }else if(process.argv[2]==='retry'){
  await db.authenticate();console.log('Notificaciones procesadas:',await retryPending());
 }else throw new Error('Usa npm run mail:verify o npm run mail:retry');
})().catch(e=>{console.error('No se completó la operación:',e.code||'revisa configuración SMTP/DB');process.exitCode=1;}).finally(()=>db.close());
