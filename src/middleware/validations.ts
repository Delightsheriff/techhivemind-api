import { Request, Response, NextFunction } from "express";
import { signinSchema, signupSchema } from "../common/schemas/authSchema";

export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }

  next();
};

export const validateSignin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = signinSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }

  next();
};
