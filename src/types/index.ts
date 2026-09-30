import type { Types } from "mongoose";

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

declare global {
  namespace Express {
    interface Request {
      userID?: string;
    }
  }
}
