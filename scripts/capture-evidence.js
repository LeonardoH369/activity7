const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=path.resolve('docs/screenshots');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
(async()=>{
 const account=JSON.parse(await fs.readFile('var/demo-account.json','utf8'));
 assert.match(account.email,/@example\.test$/,'Usa únicamente la cuenta ficticia creada por mail:demo.');
 await fs.mkdir(output,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1280,height:900},locale:'es-MX'});
  const page=await context.newPage();
  const capture=async name=>page.screenshot({path:path.join(output,name),fullPage:true});
  await page.goto('http://127.0.0.1:3009/');await capture('01-landingpage.png');
  await page.goto('http://127.0.0.1:3009/register');await capture('02-registro.png');
  await page.goto('http://127.0.0.1:3009/login');await capture('03-login.png');
  await page.goto('http://127.0.0.1:3009/dashboard');assert.ok(page.url().includes('/login?required=1'));await capture('04-dashboard-bloqueado.png');
  await page.getByLabel('Correo electrónico').fill(account.email);await page.getByLabel('Contraseña',{exact:true}).fill(account.password);
  await Promise.all([page.waitForURL('**/dashboard'),page.getByRole('button',{name:'Entrar al dashboard'}).click()]);
  await page.screenshot({path:path.join(output,'05-dashboard.png'),fullPage:true,mask:[page.locator('dd').filter({hasText:account.email})],maskColor:'#22372d'});
  const inbox=await fetch('http://127.0.0.1:8025/api/v1/messages').then(r=>r.json());
  for(const [subject,name] of [['Bienvenido a Activity 9','06-bienvenida.png'],['Nuevo inicio de sesión en Activity 9','07-alerta-login.png']]){
   const entry=inbox.messages.find(m=>m.Subject===subject && m.To.some(t=>t.Address===account.email));assert.ok(entry,'No se encontró el correo recibido: '+subject);
   const message=await fetch('http://127.0.0.1:8025/api/v1/message/'+entry.ID).then(r=>r.json());
   // Render the actual received HTML, not a fabricated template or an external inbox.
   const mailContext=await browser.newContext({viewport:{width:1100,height:850},javaScriptEnabled:false});
   const mailPage=await mailContext.newPage();
   const header='<div style="font:16px Arial;padding:24px;background:#192c29;color:white"><b>Correo recibido en Mailpit · PRUEBA LOCAL</b><p>Asunto: '+escape(message.Subject)+'</p><p>Para: [dirección de prueba oculta] · Remitente: [oculto]</p><p>Recibido: '+escape(message.Date||entry.Created)+'</p></div>';
   const receivedHtml=message.HTML || '<pre>'+escape(message.Text)+'</pre>';
   await mailPage.setContent(header+receivedHtml);await mailPage.screenshot({path:path.join(output,name),fullPage:true});await mailContext.close();
  }
  console.log('7 capturas guardadas en '+output+'. Las capturas de correo muestran el contenido recibido por SMTP local, no Gmail.');
 }finally{await browser.close();}
})().catch(error=>{console.error('No se completaron las capturas:',error.message);process.exitCode=1;});
