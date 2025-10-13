require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Conecta ao MongoDB Atlas
connectDB(process.env.MONGO_URI);

// Cria o admin padrão automaticamente
(async () => {
  try {
    const adminUser = await User.findOne({ username: process.env.ADMIN_USER });
    if (!adminUser) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASS, 10);
      await User.create({
        username: process.env.ADMIN_USER,
        passwordHash: hash,
        type: 'admin'
      });
      console.log('👑 Admin criado automaticamente (admin/123456)');
    }
  } catch (err) {
    console.error('Erro ao criar admin:', err.message);
  }
})();

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mesas', require('./routes/mesas'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/comandas', require('./routes/comandas'));

// Teste rápido
app.get('/', (req, res) => res.send('✅ API rodando!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
