import mongoose, { Schema, Types } from "mongoose";
import { orderStatuses, paymentMethods } from "../types";

const orderItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "products", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "users", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, enum: paymentMethods, default: "COD" },
    status: { type: String, enum: orderStatuses, default: "Pending" },
  },
  { timestamps: true }
);

export const orderModel = mongoose.model("orders", orderSchema);
