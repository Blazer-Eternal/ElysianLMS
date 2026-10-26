import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "node:path";
import router from "./api/routes";
import { corsOptions } from "./config";
import { errorHandler, globalLimiter } from "./middleware";
import { swaggerSpec, swaggerUi } from "./swagger/swagger";

const app = express();

// Added specific CSP override so Helmet doesn't block the inline styles on the landing page
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Serve the public folder so /LMSbg.jpg can be loaded by the browser
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ElysianLMS</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; }

          body {
            margin: 0;
            min-height: 100vh;
            /* Spot light gradient over the background image */
            background: 
              radial-gradient(circle at center, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%),
              url("/LMSbg.jpg") center / cover no-repeat fixed;
            color: #ffffff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
            -webkit-font-smoothing: antialiased;
          }

          main {
            max-width: 40rem;
            animation: fadeIn 1s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          h1 { 
            font-size: clamp(3rem, 8vw, 4.5rem); 
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 0 0 1rem; 
            text-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
          }

          .tagline { 
            font-size: clamp(1.25rem, 3vw, 1.5rem); 
            font-weight: 400;
            color: #cbd5e1; 
            margin: 0 0 1.5rem; 
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          }

          .description { 
            font-size: 1rem; 
            line-height: 1.6;
            color: #e2e8f0; 
            margin: 0 auto; 
            max-width: 32rem;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          }

          @media (prefers-reduced-motion: reduce) {
            main { animation: none; }
          }
        </style>
      </head>
      <body>
        <main>
          <h1>ElysianLMS</h1>
          <p class="tagline">A calm place to learn.</p>
          <p class="description">
            Learning should feel simple. Elysian keeps things quiet so students can focus and teachers can teach. Everything else just works in the background.
          </p>
        </main>
      </body>
    </html>
    `);
});

app.use("/api", globalLimiter);
app.use("/api", router);

// Interactive API documentation (Swagger UI). The raw OpenAPI document is
// served at /api-docs.json; the browsable UI lives at /api-docs.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use(errorHandler);

export default app;