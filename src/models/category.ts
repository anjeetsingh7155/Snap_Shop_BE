import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
  title: { type: String, required: true, unique: true, trim: true },
});

export const categoryModel = mongoose.model("categories", categorySchema);
