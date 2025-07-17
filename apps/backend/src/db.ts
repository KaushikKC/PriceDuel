import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/price-dual";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true, useUnifiedTopology: true // not needed in mongoose 6+
  });
  console.log("MongoDB connected");
}
