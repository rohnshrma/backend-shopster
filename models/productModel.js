import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
      enum: ["Electronics", "Fashion", "Books"],
      default: "Electronics",
    },

    price: {
      type: Number,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
