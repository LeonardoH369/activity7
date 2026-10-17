const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', project: 'activity7' }));
app.use('/assets', express.static(path.join(__dirname, '../public')));
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use((error, req, res, next) => {
  if (error.status === 400) return res.status(400).json({ message: error.message });
  console.error(error.message);
  res.status(500).json({ message: 'Error interno del servidor' });
});
module.exports = app;
