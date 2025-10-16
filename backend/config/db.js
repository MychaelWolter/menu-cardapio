const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Conectando ao MongoDB...");
    console.log("URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      family: 4, 
    });

    console.log("✅ MongoDB conectado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
