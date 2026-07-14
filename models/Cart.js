import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer", 
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;