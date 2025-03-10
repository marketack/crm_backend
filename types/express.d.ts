import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      email: string;
      roles: string[];
      company?: string | null;
    };
  }
}
