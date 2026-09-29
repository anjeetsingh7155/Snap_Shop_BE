import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { categoryModel } from "../models/category";
import { productModel } from "../models/product";

const categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports"];

const products = [
  { title: "Wireless Earbuds", description: "Bluetooth earbuds with charging case and long battery life.", price: 1999, stock: 40, category: "Electronics" },
  { title: "Smart Watch", description: "Fitness tracking watch with heart-rate and sleep monitor.", price: 3499, stock: 25, category: "Electronics" },
  { title: "Bluetooth Speaker", description: "Portable water-resistant speaker with clear sound.", price: 1499, stock: 30, category: "Electronics" },
  { title: "Men's Cotton T-Shirt", description: "Soft, breathable everyday cotton t-shirt.", price: 499, stock: 100, category: "Fashion" },
  { title: "Women's Denim Jacket", description: "Classic fit denim jacket for all seasons.", price: 1799, stock: 35, category: "Fashion" },
  { title: "Running Shoes", description: "Lightweight cushioned shoes for running and gym.", price: 2499, stock: 50, category: "Fashion" },
  { title: "Non-stick Frying Pan", description: "26 cm non-stick pan with a comfortable handle.", price: 899, stock: 45, category: "Home & Kitchen" },
  { title: "Steel Water Bottle", description: "1 litre insulated stainless steel bottle.", price: 599, stock: 80, category: "Home & Kitchen" },
  { title: "LED Desk Lamp", description: "Adjustable desk lamp with three brightness levels.", price: 749, stock: 60, category: "Home & Kitchen" },
  { title: "JavaScript for Beginners", description: "Step-by-step guide to learning JavaScript from scratch.", price: 399, stock: 70, category: "Books" },
  { title: "Personal Finance Basics", description: "Simple lessons on saving, budgeting and investing.", price: 349, stock: 65, category: "Books" },
  { title: "Indian Cooking Made Simple", description: "Easy everyday recipes with clear instructions.", price: 449, stock: 55, category: "Books" },
  { title: "Yoga Mat", description: "6 mm anti-slip yoga mat with carry strap.", price: 699, stock: 75, category: "Sports" },
  { title: "Cricket Bat", description: "Kashmir willow bat for tennis-ball and practice games.", price: 1299, stock: 20, category: "Sports" },
  { title: "Badminton Racket Set", description: "Set of two rackets with shuttlecocks and a bag.", price: 999, stock: 40, category: "Sports" },
];

const seed = async () => {
  await connectDB();

  // clears old sample data, then adds fresh data
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});

  const createdCategories = await categoryModel.insertMany(
    categories.map((title) => ({ title }))
  );
  const idByTitle = new Map(createdCategories.map((c) => [c.title, c._id]));

  await productModel.insertMany(
    products.map((p) => ({
      title: p.title,
      description: p.description,
      price: p.price,
      stock: p.stock,
      image: `https://picsum.photos/seed/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/600/600`,
      categoryId: idByTitle.get(p.category),
    }))
  );

  console.log(`Seeded ${categories.length} categories and ${products.length} products`);
  await mongoose.disconnect();
};

seed().catch((e) => {
  console.log(`seed failed: ${e}`);
  process.exit(1);
});
