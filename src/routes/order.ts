import { Router, Request, Response } from "express";
import * as z from "zod";
import mongoose, { Types } from "mongoose";
import { cartModel } from "../models/cart";
import { productModel } from "../models/product";
import { orderModel } from "../models/order";
import { AuthMiddleware } from "../middleware/auth";
import { validationError } from "../utils/validate";

const router = Router();

const checkoutSchema = z.object({
  shippingAddress: z.string().min(5).max(300),
  phone: z.string().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
});

type StockChange = { productId: Types.ObjectId; quantity: number };

const restoreStock = async (changes: StockChange[]) => {
  for (const c of changes) {
    await productModel.updateOne({ _id: c.productId }, { $inc: { stock: c.quantity } });
  }
  changes.length = 0;
};

router.post("/", AuthMiddleware, async (req: Request, res: Response) => {
  const reduced: StockChange[] = [];
  let orderCreated = false;

  try {
    const safeObject = checkoutSchema.safeParse(req.body);
    if (!safeObject.success) {
      return validationError(res, safeObject.error);
    }
    const { shippingAddress, phone } = safeObject.data;
    const userId = req.userID as string;

    const cart = await cartModel.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const products = await productModel.find({
      _id: { $in: cart.items.map((i) => i.productId) },
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const item of cart.items) {
      const p = productMap.get(item.productId.toString());
      if (!p) {
        return res
          .status(400)
          .json({ message: "A product in your cart is no longer available" });
      }
      orderItems.push({
        productId: p._id,
        title: p.title,
        price: p.price,
        image: p.image,
        quantity: item.quantity,
      });
    }

    for (const item of orderItems) {
      const result = await productModel.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount === 0) {
        await restoreStock(reduced);
        return res.status(400).json({ message: `Not enough stock for ${item.title}` });
      }
      reduced.push({ productId: item.productId, quantity: item.quantity });
    }

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await orderModel.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      phone,
      paymentMethod: "COD",
    });
    orderCreated = true;

    await cartModel.updateOne({ userId }, { $set: { items: [] } });

    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (error: any) {
    if (!orderCreated) {
      await restoreStock(reduced);
    }
    return res.status(500).json({ message: "Error placing order", error: error.message });
  }
});

router.get("/", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await orderModel
      .find({ userId: req.userID })
      .sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await orderModel.findOne({ _id: id, userId: req.userID });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
