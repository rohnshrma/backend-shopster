import mongoose from "mongoose";
import Buyer from "../models/buyerModel.js";
import Order from "../models/Order.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/customers
// Admin: Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100,
    );

    const search = (req.query.search || "").trim();

    const filter = {};

    if (search) {
      filter.$or = [
        {
          username: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Buyer.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Buyer.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: "Success",
      message: "Customers fetched successfully",
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch customers: ${error.message}`,
    });
  }
};

// GET /api/customers/:id
// Admin: Get one customer
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    const customer = await Buyer.findById(id).select("-password");

    if (!customer) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    const orderStats = await Order.aggregate([
      {
        $match: {
          buyer: customer._id,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
    };

    return res.status(200).json({
      status: "Success",
      message: "Customer fetched successfully",
      data: {
        ...customer.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch customer: ${error.message}`,
    });
  }
};

// GET /api/customers/:id/orders
// Admin: Get customer's orders
export const getCustomerOrders = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    const customer = await Buyer.findById(id).select("_id");

    if (!customer) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      buyer: customer._id,
    })
      .sort({ createdAt: -1 })
      .populate("items.product");

    return res.status(200).json({
      status: "Success",
      message: "Customer orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch customer orders: ${error.message}`,
    });
  }
};

// PUT /api/customers/:id/status
// Admin: Block / Unblock customer
export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        status: "Fail",
        message: "isBlocked must be true or false",
      });
    }

    const customer = await Buyer.findByIdAndUpdate(
      id,
      {
        isBlocked,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!customer) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: isBlocked
        ? "Customer blocked successfully"
        : "Customer unblocked successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to update customer status: ${error.message}`,
    });
  }
};

// DELETE /api/customers/:id
// Admin: Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    const customer = await Buyer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        status: "Fail",
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to delete customer: ${error.message}`,
    });
  }
};