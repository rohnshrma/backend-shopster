import fs from "fs";
import path from "path";

import getSettings from "../utils/settingsHelper.js";

const allowedFields = [
  "storeName",
  "storeEmail",
  "supportPhone",
  "address",
  "currency",
  "taxPercentage",
  "shippingRate",
  "freeShippingThreshold",
  "codEnabled",
  "stripeEnabled",
  "maintenanceMode",
];

const booleanFields = [
  "codEnabled",
  "stripeEnabled",
  "maintenanceMode",
];

const numberFields = [
  "taxPercentage",
  "shippingRate",
  "freeShippingThreshold",
];

// GET /api/settings
// Public
export const getStoreSettings = async (req, res) => {
  try {
    const settings = await getSettings();

    return res.status(200).json({
      status: "Success",
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch settings: ${error.message}`,
    });
  }
};

// PUT /api/settings
// Admin only
export const updateStoreSettings = async (req, res) => {
  try {
    const settings = await getSettings();

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (booleanFields.includes(field)) {
          if (typeof req.body[field] !== "boolean") {
            return res.status(400).json({
              status: "Fail",
              message: `${field} must be true or false`,
            });
          }
        }

        if (numberFields.includes(field)) {
          const value = Number(req.body[field]);

          if (Number.isNaN(value) || value < 0) {
            return res.status(400).json({
              status: "Fail",
              message: `${field} must be a valid non-negative number`,
            });
          }

          if (
            field === "taxPercentage" &&
            value > 100
          ) {
            return res.status(400).json({
              status: "Fail",
              message:
                "taxPercentage cannot be greater than 100",
            });
          }

          req.body[field] = value;
        }

        settings[field] = req.body[field];
      }
    }

    // Handle new logo
    if (req.file) {
      if (settings.logo) {
        const oldLogoPath = path.join(
          process.cwd(),
          settings.logo.replace(/^\//, ""),
        );

        if (fs.existsSync(oldLogoPath)) {
          try {
            fs.unlinkSync(oldLogoPath);
          } catch (error) {
            console.warn(
              "Could not delete old logo:",
              error.message,
            );
          }
        }
      }

      settings.logo = `/uploads/branding/${req.file.filename}`;
    }

    await settings.save();

    return res.status(200).json({
      status: "Success",
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to update settings: ${error.message}`,
    });
  }
};