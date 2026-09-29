import mongoose, { Schema, Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "products", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "users", required: true, unique: true },
  items: [cartItemSchema],
});

export const cartModel = mongoose.model("carts", cartSchema);
