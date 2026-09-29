import { Router, Request, Response } from "express";
import * as z from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user";
import { AuthMiddleware } from "../middleware/auth";

const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email(),
  password: z.string().min(6).max(30),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(3).max(30).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const validationError = (res: Response, error: z.ZodError) => {
  return res.status(400).json({
    message: "Validation Failed",
    errors: error.issues.map((err) => ({
      field: err.path.map(String).join("."),
      message: err.message,
    })),
  });
};

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const safeObject = registerSchema.safeParse(req.body);
    if (!safeObject.success) {
      return validationError(res, safeObject.error);
    }

    const { name, email, password, phone, address } = safeObject.data;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists. Please login." });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await userModel.create({ name, email, password: hashedPass, phone, address });

    return res.status(201).json({ message: "Registration completed" });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const user = await userModel.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const SESSION_SECRET = process.env.SESSION_SECRET;
    if (!SESSION_SECRET) {
      return res.status(500).json({ message: "JWT secret not defined" });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, SESSION_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

authRouter.get("/profile", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(req.userID).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

authRouter.put("/profile", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const safeObject = profileSchema.safeParse(req.body);
    if (!safeObject.success) {
      return validationError(res, safeObject.error);
    }

    const user = await userModel
      .findByIdAndUpdate(req.userID, safeObject.data, { new: true })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Profile updated", user });
  } catch (error: any) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default authRouter;
