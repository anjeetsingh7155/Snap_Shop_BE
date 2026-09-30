import { Router, Request, Response } from "express";
import { categoryModel } from "../models/category";

const categoryRouter = Router();

categoryRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await categoryModel.find().sort({ title: 1 });
    return res.status(200).json({ categories });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default categoryRouter;
