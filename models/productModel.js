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

    thumbnail: {
      type: String,
      default: null,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        public_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
