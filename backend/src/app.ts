import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import router from "./api/routes";
import { corsOptions } from "./config";
import { errorHandler, globalLimiter } from "./middleware";
import { swaggerSpec, swaggerUi } from "./swagger/swagger";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ElysianLMS</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #f8fafc;
            font-family: Georgia, serif;
            text-align: center;
          }
          h1 { font-size: 3rem; margin: 0 0 0.5rem; }
          p { font-size: 1.25rem; color: #94a3b8; margin: 0; }
        </style>
      </head>
      <body>
        <h1>ElysianLMS</h1>
        <p class="heading">A calm place to learn.</p>
<p class="body">Learning should feel simple. Elysian keeps things quiet so students can focus and teachers can teach. Everything else just works in the background.</p>
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