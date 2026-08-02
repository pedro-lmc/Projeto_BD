require('dotenv').config();

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API do Hospital Dra. Yuska rodando perfeitamente!' });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🏥 Servidor rodando com sucesso na porta ${PORT}`);
});