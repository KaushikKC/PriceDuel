import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://kccreations1704:Dh6RacrAhYHxzpX4@cluster0.4lij9.mongodb.net/";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true, useUnifiedTopology: true // not needed in mongoose 6+
  });
  console.log("MongoDB connected");
}
