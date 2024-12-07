import { Request, Response, NextFunction } from "express";
import { signinSchema, signupSchema } from "../common/schemas/authSchema";

export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    res.status(400).json({ errors });
    return; // Ensure the function ends here to avoid calling next()
  }

  next(); // Call next() only if validation succeeds
};

export const validateSignin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = signinSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    res.status(400).json({ errors });
    return; // Ensure the function ends here to avoid calling next()
  }

  next(); // Call next() only if validation succeeds
};
