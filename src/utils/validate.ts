import type { Response } from "express";
import * as z from "zod";

export const validationError = (res: Response, error: z.ZodError) => {
  return res.status(400).json({
    message: "Validation Failed",
    errors: error.issues.map((err) => ({
      field: err.path.map(String).join("."),
      message: err.message,
    })),
  });
};
