import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },

    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },

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
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
