import Buyer from "../models/buyerModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const buyerRegister = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;

    if (!username || !email || !password || !phone || !address) {
      return res.status(400).json({
        status: "fail",
        message: "All fields Are Required",
      });
    }

    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(409).json({
        status: "fail",
        message: "Buyer Already Exist",
      });
    }

    const newBuyer = await Buyer.create({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      phone,
      address,
    });

    const token = jwt.sign({ id: newBuyer._id }, process.env.JWT_BUYER, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      status: "Success",
      message: "Buyer Registered Successfully",
      data: newBuyer,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: `Failed to register Buyer ${error.message}`,
    });
  }
};

export const buyerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).json({
        status: "fail",
        message: "All Field Are Required",
      });
    }

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).json({
        status: "fail",
        message: "Buyer Not Found",
      });
    }

    const ismatched = await bcrypt.compare(password, buyer.password);
    if (!ismatched) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: buyer._id }, process.env.JWT_BUYER, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      status: "Success",
      message: "Buyer Login Successfully",
      data: buyer,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: `Buyer failed to login: ${error.message}`,
    });
  }
};

// Profile CRUD

export const getProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user?._id || req.user?.id).select(
      "-password",
    );

    if (!buyer) {
      return res.status(404).json({
        status: "fail",
        message: "Buyer Not Found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Buyer Profile Fetched Successfully",
      data: buyer,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: `Failed to fetch buyer: ${error.message}`,
    });
  }
};

export const updateBuyer = async (req, res) => {
  try {
    const rawId = req.params.id || req.user?._id || req.user?.id;
    const id = typeof rawId === "string" ? rawId.replace(/^:/, "") : rawId;
    const { username, phone, address } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "Buyer ID is required",
      });
    }

    if (!username || !phone || !address) {
      return res.status(400).json({
        status: "fail",
        message: "All Field Are Required",
      });
    }

    const buyer = await Buyer.findById(id);
    if (!buyer) {
      return res.status(404).json({
        status: "fail",
        message: "Buyer Not Found",
      });
    }

    const updatedBuyer = await Buyer.findByIdAndUpdate(
      id,
      { username, phone, address },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      status: "Success",
      message: "Buyer Updated Successfully",
      data: updatedBuyer,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: `Failed to update: ${error.message}`,
    });
  }
};

export const deleteBuyer = async (req, res) => {
  try {
    const rawId = req.params.id || req.body.id || req.user?._id || req.user?.id;
    const id = typeof rawId === "string" ? rawId.replace(/^:/, "") : rawId;

    const buyer = await Buyer.findByIdAndDelete(id);
    if (!buyer) {
      return res.status(404).json({
        status: "fail",
        message: "Buyer Not Found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: `Failed to Deleted: ${error.message}`,
    });
  }
};