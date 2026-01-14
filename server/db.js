
const mongoose = require('mongoose');

const connectDB = async (url) => {
  try {
    
    const conn = await mongoose.connect(process.env.MONGO_URI || url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;