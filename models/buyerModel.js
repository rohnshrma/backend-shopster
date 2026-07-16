import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
    },
    phone: {
      type: Number,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Buyer", buyerSchema);
