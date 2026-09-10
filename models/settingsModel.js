import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Shopster",
      trim: true,
    },

    storeEmail: {
      type: String,
      default: "",
      trim: true,
    },

    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    shippingRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    freeShippingThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },

    codEnabled: {
      type: Boolean,
      default: true,
    },

    stripeEnabled: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Settings", settingsSchema);