import mongoose, { Schema, Types } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    categoryId: { type: Types.ObjectId, ref: "categories", required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const productModel = mongoose.model("products", productSchema);
