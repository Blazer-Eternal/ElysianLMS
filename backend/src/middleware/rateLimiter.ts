import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { rateLimitConfig } from "../config";

const { windowMin, max, authMax, loginMax, sensitiveMax } = rateLimitConfig;
const windowMs = windowMin * 60 * 1000;

const tooMany = (message: string) => (_req: Request, res: Response) =>
    res.status(429).json({ success: false, message });

// Broad ceiling for every /api route: shields the database from floods
// while leaving plenty of headroom for a normal UI session.
export const globalLimiter = rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooMany("Too many requests, please try again later"),
});

// General auth endpoints (signup, refresh): moderate budget.
export const authLimiter = rateLimit({
    windowMs,
    limit: authMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooMany("Too many auth attempts, please try again later"),
});

// Login: strict budget on FAILED attempts only — a burst of successful
// logins (test suites, several devices) does not consume it, but password
// guessing burns it after loginMax failures within the window.
export const loginLimiter = rateLimit({
    windowMs,
    limit: loginMax,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: tooMany("Too many failed login attempts, please try again later"),
});

// Password reset endpoints: very strict, every request counts (each one
// either emails a link or validates a token — abuse surface).
export const sensitiveLimiter = rateLimit({
    windowMs,
    limit: sensitiveMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooMany("Too many attempts, please try again later"),
});
