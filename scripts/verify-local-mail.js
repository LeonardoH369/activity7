const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const base='http://127.0.0.1:3009';
let cookie='';
async function call(route,fields){
 const response=await fetch(base+route,{method:fields?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(fields?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body:fields?new URLSearchParams(fields):undefined,redirect:'manual'});
 const received=response.headers.getSetCookie();if(received.length)cookie=received.map(s=>s.split(';')[0]).join('; ');
 return {status:response.status,location:response.headers.get('location'),body:await response.text()};
}
const csrf=body=>body.match(/name="_csrf" value="([a-f0-9]+)"/)[1];
(async()=>{
 // This script intentionally targets only the fixed local app and local inbox.
 const settings=await fs.readFile('.env','utf8');
 assert.match(settings,/^MAIL_MODE=['"]?local['"]?\s*$/m,'Configura MAIL_MODE=local antes de esta prueba.');
 const email='alumno-'+Date.now()+'@example.test',password=randomBytes(24).toString('base64url');
 let response=await call('/dashboard');assert.equal(response.status,303);
 response=await call('/register');assert.equal(response.status,200);
 response=await call('/register',{_csrf:csrf(response.body),name:'Alumno de prueba',email,password,password_confirmation:password});assert.equal(response.status,303);
 response=await call('/dashboard');assert.equal(response.status,200);
 response=await call('/logout',{_csrf:csrf(response.body)});assert.equal(response.status,303);
 response=await call('/login');response=await call('/login',{_csrf:csrf(response.body),email,password});assert.equal(response.status,303);
 const inbox=await fetch('http://127.0.0.1:8025/api/v1/messages').then(r=>r.json());
 const received=inbox.messages.filter(m=>m.To.some(to=>to.Address===email));
 assert.equal(received.length,2);assert.ok(received.some(m=>m.Subject==='Bienvenido a Activity 9'));assert.ok(received.some(m=>m.Subject==='Nuevo inicio de sesión en Activity 9'));
 const report={checkedAt:new Date().toISOString(),transport:'SMTP local / Mailpit',externalDelivery:false,guestDashboard:'redirected to login',registration:'passed',login:'passed',recipientMatchesDatabase:true,messages:received.map(m=>({subject:m.Subject,createdAt:m.Created,recipient:'alumno-***@example.test'}))};
 await fs.mkdir('docs/evidence',{recursive:true});await fs.writeFile('docs/evidence/local-mail-test.json',JSON.stringify(report,null,2)+'\n');
 await fs.mkdir('var',{recursive:true});await fs.writeFile('var/demo-account.json',JSON.stringify({email,password,note:'Solo cuenta de prueba local; no publicar.'},null,2));
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
