import { Router } from "express";
import {
  addProduct,
  deletProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/productController.js";

const router = Router();

router.route("/fetch").get(getAllProducts);
router.route("/added").post(addProduct);
router.route("/updated/:id").put(updateProduct);
router.route("/deleted/:id").delete(deletProduct);

export default router;
