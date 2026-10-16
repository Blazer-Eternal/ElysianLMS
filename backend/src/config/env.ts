import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT;

export const environment = process.env.ENVIRONMENT;

export const db = {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT || "5432",
    dialect: process.env.DB_DIALECT || "postgres",
} as {
    host: string;
    username: string;
    password: string;
    name: string;
    port: string;
    dialect: string;
};

export const jwtSecret = process.env.JWT_SECRET_KEY as string;

// Comma-separated list of browser origins allowed to call the API (CORS).
// Must be set for production deployments; unset falls back to dev defaults.
export const clientUrl = process.env.CLIENT_URL;

// JWT access tokens are short-lived; longer sessions live in the sessions
// table as opaque refresh tokens (see authServices).
export const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || "15m";
export const refreshTokenTtl = process.env.REFRESH_TOKEN_TTL || "7d";
export const resetTokenTtl = process.env.RESET_TOKEN_TTL || "30m";

// Rate limits are per IP. Tunable through .env without code changes.
export const rateLimitConfig = {
    windowMin: Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15,
    max: Number(process.env.RATE_LIMIT_MAX) || 600,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
    loginMax: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
    sensitiveMax: Number(process.env.SENSITIVE_RATE_LIMIT_MAX) || 10,
};