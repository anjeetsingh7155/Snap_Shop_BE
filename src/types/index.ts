import type { Types } from "mongoose";

// this is the file where the shared types are declared
export const orderStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const paymentMethods = ["COD"] as const;

export type userType = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

// lets us use req.userID without @ts-ignore
declare global {
  namespace Express {
    interface Request {
      userID?: string;
    }
  }
}
