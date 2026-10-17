const app = require('./app');
const { sequelize } = require('./models');
sequelize.authenticate().then(() => {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => console.log(`activity7: http://localhost:${port}`));
}).catch((error) => { console.error(error.message); process.exitCode = 1; });
