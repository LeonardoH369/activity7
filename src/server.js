const { db } = require('./models');
const app = require('./app')();
let server;
db.authenticate().then(()=>{server=app.listen(Number(process.env.PORT||3009),'127.0.0.1',()=>console.log('Activity 9: http://localhost:'+(process.env.PORT||3009)));}).catch(e=>{console.error(e.message);app.locals.sessionStore.stopExpiringSessions();process.exitCode=1;});
async function stop(){if(server)await new Promise(r=>server.close(r));app.locals.sessionStore.stopExpiringSessions();await db.close();}
process.once('SIGINT',()=>stop());process.once('SIGTERM',()=>stop());
