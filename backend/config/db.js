const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Conectando ao MongoDB Local...");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // Reduzido para local
      connectTimeoutMS: 20000, // Reduzido para local
      family: 4,
    });

    console.log("✅ MongoDB Local conectado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB Local:");
    console.error("Verifique se o MongoDB está rodando localmente");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
