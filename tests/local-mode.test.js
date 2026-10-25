const {test,after}=require('node:test');
const assert=require('node:assert/strict');
process.env.NODE_ENV='test';
const {transportConfig}=require('../src/services/mailer');
const {db}=require('../src/models');
after(()=>db.close());
test('local mail always targets loopback without credentials',()=>{
 process.env.MAIL_MODE='local';process.env.SMTP_HOST='remote.invalid';process.env.SMTP_USER='ignored';process.env.SMTP_PASSWORD='ignored';
 const c=transportConfig();assert.equal(c.mode,'local');assert.equal(c.transport.options.host,'127.0.0.1');assert.equal(c.transport.options.port,1025);assert.equal(c.transport.options.auth,undefined);c.transport.close();
});
test('local mail is rejected in production',()=>{
 process.env.NODE_ENV='production';assert.throws(()=>transportConfig(),/producción/);process.env.NODE_ENV='test';
});
