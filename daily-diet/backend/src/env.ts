import "dotenv/config";
export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3333,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
};
