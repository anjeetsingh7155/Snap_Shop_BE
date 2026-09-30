import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { productModel } from "../models/product";

const productRouter = Router();

productRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    const filter: Record<string, unknown> = {};

    if (typeof search === "string" && search.trim() !== "") {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escaped, $options: "i" };
    }

    if (typeof category === "string" && category !== "") {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      filter.categoryId = category;
    }

    const products = await productModel
      .find(filter)
      .populate({ path: "categoryId", select: "title" })
      .sort({ createdAt: -1 });

    return res.status(200).json({ products });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

productRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await productModel
      .findById(id)
      .populate({ path: "categoryId", select: "title" });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ product });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default productRouter;
