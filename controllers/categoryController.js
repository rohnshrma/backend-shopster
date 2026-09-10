import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Category from "../models/category.js";
import Product from "../models/productModel.js";

const invalidIdResponse = (res) =>
  res.status(400).json({
    status: "Fail",
    message: "Invalid category ID",
  });

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleDatabaseError = (error, res, action) => {
  if (error.code === 11000) {
    return res.status(409).json({
      status: "Fail",
      message: "Category name already exists",
    });
  }

  return res.status(500).json({
    status: "Fail",
    message: `Failed to ${action} category: ${error.message}`,
  });
};

export const getAllCategories = async (req, res) => {
  try {
    const includeInactive = req.query.all === "true" && req.user;
    const filter = includeInactive ? {} : { active: true };
    const categories = await Category.find(filter).sort({ name: 1 });

    return res.status(200).json({
      status: "Success",
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return handleDatabaseError(error, res, "fetch");
  }
};

export const getCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return invalidIdResponse(res);

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: "Fail",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return handleDatabaseError(error, res, "fetch");
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        status: "Fail",
        message: "Category name is required",
      });
    }

    const categoryData = {
      name: name.trim(),
      description,
      active,
    };

    if (req.file) {
      categoryData.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const category = await Category.create(categoryData);

    return res.status(201).json({
      status: "Success",
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return handleDatabaseError(error, res, "create");
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return invalidIdResponse(res);

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "Fail",
        message: "Category not found",
      });
    }

    const { name, description, active } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
          status: "Fail",
          message: "Category name cannot be empty",
        });
      }
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;
    if (active !== undefined) category.active = active;

    if (req.file) {
      const oldPublicId = category.image?.public_id;
      category.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
      if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
    }

    await category.save();

    return res.status(200).json({
      status: "Success",
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return handleDatabaseError(error, res, "update");
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) return invalidIdResponse(res);

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "Fail",
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0) {
      return res.status(409).json({
        status: "Fail",
        message: `Cannot delete this category because ${productCount} product${productCount === 1 ? " is" : "s are"} still using it.`,
      });
    }

    await category.deleteOne();

    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    return res.status(200).json({
      status: "Success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return handleDatabaseError(error, res, "delete");
  }
};
