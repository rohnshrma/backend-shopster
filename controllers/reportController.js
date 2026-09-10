import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Buyer from "../models/buyerModel.js";
import Order from "../models/Order.js";

const REVENUE_STATUSES = [
  "Confirmed",
  "Shipped",
  "Delivered",
];

const getDateRange = (startDate, endDate) => {
  const end = endDate ? new Date(endDate) : new Date();

  if (Number.isNaN(end.getTime())) {
    return null;
  }

  end.setHours(23, 59, 59, 999);

  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const getRevenueMatch = () => ({
  $or: [
    {
      status: {
        $in: REVENUE_STATUSES,
      },
    },
    {
      paymentStatus: "paid",
    },
  ],
});

// GET /api/reports/summary
export const getSummary = async (req, res) => {
  try {
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
    );

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      revenueResult,
      currentMonthOrders,
      previousMonthOrders,
      currentMonthCustomers,
      previousMonthCustomers,
      currentMonthProducts,
      previousMonthProducts,
    ] = await Promise.all([
      Product.countDocuments(),

      Order.countDocuments(),

      Buyer.countDocuments(),

      Order.aggregate([
        {
          $match: getRevenueMatch(),
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.countDocuments({
        createdAt: {
          $gte: currentMonthStart,
          $lt: nextMonthStart,
        },
      }),

      Order.countDocuments({
        createdAt: {
          $gte: previousMonthStart,
          $lt: currentMonthStart,
        },
      }),

      Buyer.countDocuments({
        createdAt: {
          $gte: currentMonthStart,
          $lt: nextMonthStart,
        },
      }),

      Buyer.countDocuments({
        createdAt: {
          $gte: previousMonthStart,
          $lt: currentMonthStart,
        },
      }),

      Product.countDocuments({
        createdAt: {
          $gte: currentMonthStart,
          $lt: nextMonthStart,
        },
      }),

      Product.countDocuments({
        createdAt: {
          $gte: previousMonthStart,
          $lt: currentMonthStart,
        },
      }),
    ]);

    const totalRevenue = revenueResult[0]?.revenue || 0;

    const currentRevenueResult = await Order.aggregate([
      {
        $match: {
          ...getRevenueMatch(),
          createdAt: {
            $gte: currentMonthStart,
            $lt: nextMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const previousRevenueResult = await Order.aggregate([
      {
        $match: {
          ...getRevenueMatch(),
          createdAt: {
            $gte: previousMonthStart,
            $lt: currentMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const currentRevenue =
      currentRevenueResult[0]?.revenue || 0;

    const previousRevenue =
      previousRevenueResult[0]?.revenue || 0;

    const percentageChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }

      return Number(
        (((current - previous) / previous) * 100).toFixed(2),
      );
    };

    return res.status(200).json({
      status: "Success",
      message: "Report summary fetched successfully",
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,

        changeSinceLastMonth: {
          products: percentageChange(
            currentMonthProducts,
            previousMonthProducts,
          ),

          orders: percentageChange(
            currentMonthOrders,
            previousMonthOrders,
          ),

          customers: percentageChange(
            currentMonthCustomers,
            previousMonthCustomers,
          ),

          revenue: percentageChange(
            currentRevenue,
            previousRevenue,
          ),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch report summary: ${error.message}`,
    });
  }
};

// GET /api/reports/sales-over-time
export const getSalesOverTime = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = "day",
    } = req.query;

    if (!["day", "month"].includes(groupBy)) {
      return res.status(400).json({
        status: "Fail",
        message: "groupBy must be day or month",
      });
    }

    const range = getDateRange(
      startDate,
      endDate,
    );

    if (!range) {
      return res.status(400).json({
        status: "Fail",
        message: "Invalid startDate or endDate",
      });
    }

    const dateFormat =
      groupBy === "month"
        ? "%Y-%m"
        : "%Y-%m-%d";

    const result = await Order.aggregate([
      {
        $match: {
          ...getRevenueMatch(),
          createdAt: {
            $gte: range.start,
            $lte: range.end,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orderCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: "Success",
      message: "Sales report fetched successfully",
      data: result.map((item) => ({
        period: item._id,
        revenue: item.revenue,
        orderCount: item.orderCount,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch sales report: ${error.message}`,
    });
  }
};

// GET /api/reports/top-products
export const getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 5, 1),
      50,
    );

    const result = await Order.aggregate([
      {
        $match: getRevenueMatch(),
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.product",

          productName: {
            $first: "$items.name",
          },

          quantitySold: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: {
              $multiply: [
                "$items.price",
                "$items.quantity",
              ],
            },
          },
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },

      {
        $limit: limit,
      },
    ]);

    const productIds = result
      .map((item) => item._id)
      .filter(Boolean);

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).select("name");

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product.name,
      ]),
    );

    return res.status(200).json({
      status: "Success",
      message: "Top products report fetched successfully",
      data: result.map((item) => ({
        productId: item._id,
        productName:
          productMap.get(item._id?.toString()) ||
          item.productName,

        quantitySold: item.quantitySold,
        revenue: item.revenue,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch top products: ${error.message}`,
    });
  }
};

// GET /api/reports/orders-by-status
export const getOrdersByStatus = async (req, res) => {
  try {
    const statuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const result = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const countMap = new Map(
      result.map((item) => [
        item._id,
        item.count,
      ]),
    );

    return res.status(200).json({
      status: "Success",
      message: "Orders by status report fetched successfully",
      data: statuses.map((status) => ({
        status,
        count: countMap.get(status) || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch orders by status: ${error.message}`,
    });
  }
};

// GET /api/reports/top-customers
export const getTopCustomers = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 5, 1),
      50,
    );

    const result = await Order.aggregate([
      {
        $match: getRevenueMatch(),
      },

      {
        $group: {
          _id: "$buyer",

          totalSpent: {
            $sum: "$totalAmount",
          },

          orderCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalSpent: -1,
        },
      },

      {
        $limit: limit,
      },
    ]);

    const buyerIds = result
      .map((item) => item._id)
      .filter(Boolean);

    const buyers = await Buyer.find({
      _id: {
        $in: buyerIds,
      },
    }).select("username email");

    const buyerMap = new Map(
      buyers.map((buyer) => [
        buyer._id.toString(),
        buyer,
      ]),
    );

    return res.status(200).json({
      status: "Success",
      message: "Top customers report fetched successfully",
      data: result.map((item) => {
        const buyer = buyerMap.get(
          item._id?.toString(),
        );

        return {
          customerId: item._id,
          username: buyer?.username || "Unknown",
          email: buyer?.email || "",
          totalSpent: item.totalSpent,
          orderCount: item.orderCount,
        };
      }),
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: `Failed to fetch top customers: ${error.message}`,
    });
  }
};