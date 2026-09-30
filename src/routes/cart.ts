import { Router, Request, Response } from "express";
import * as z from "zod";
import mongoose from "mongoose";
import { cartModel } from "../models/cart";
import { productModel } from "../models/product";
import { AuthMiddleware } from "../middleware/auth";
import { validationError } from "../utils/validate";

const router = Router();

const productIdSchema = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), "Invalid product id");

const addSchema = z.object({
  productId: productIdSchema,
  quantity: z.number().int().min(1).max(20).default(1),
});

const updateSchema = z.object({
  productId: productIdSchema,
  quantity: z.number().int().min(1).max(20),
});

const buildCartResponse = async (userId: string) => {
  const cart = await cartModel.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  const ids = cart.items.map((i) => i.productId);
  const products = await productModel.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const items = cart.items.flatMap((i) => {
    const p = productMap.get(i.productId.toString());
    if (!p) return [];
    return [
      {
        productId: p._id,
        title: p.title,
        price: p.price,
        image: p.image,
        stock: p.stock,
        quantity: i.quantity,
        subtotal: p.price * i.quantity,
      },
    ];
  });

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.subtotal, 0);
  return { items, totalItems, totalPrice };
};

router.get("/", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const cart = await buildCartResponse(req.userID as string);
    return res.status(200).json({ cart });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/add", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const safeObject = addSchema.safeParse(req.body);
    if (!safeObject.success) {
      return validationError(res, safeObject.error);
    }
    const { productId, quantity } = safeObject.data;
    const userId = req.userID as string;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, items: [] });
    }

    const existing = cart.items.find((i) => i.productId.toString() === productId);
    const newQuantity = (existing ? existing.quantity : 0) + quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} in stock` });
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      cart.items.push({ productId: product._id, quantity });
    }
    await cart.save();

    return res.status(200).json({
      message: "Added to cart",
      cart: await buildCartResponse(userId),
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/update", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const safeObject = updateSchema.safeParse(req.body);
    if (!safeObject.success) {
      return validationError(res, safeObject.error);
    }
    const { productId, quantity } = safeObject.data;
    const userId = req.userID as string;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} in stock` });
    }

    const cart = await cartModel.findOne({ userId });
    const item = cart?.items.find((i) => i.productId.toString() === productId);
    if (!cart || !item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      message: "Cart updated",
      cart: await buildCartResponse(userId),
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/remove/:productId", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const userId = req.userID as string;

    await cartModel.updateOne({ userId }, { $pull: { items: { productId } } });

    return res.status(200).json({
      message: "Removed from cart",
      cart: await buildCartResponse(userId),
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
