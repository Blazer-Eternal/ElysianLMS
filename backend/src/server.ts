import app from "./app";
import { port } from "./config";
import { Database } from "./config/dbInstance";

const PORT = Number(port) || 5000;

const start = async () => {
  await Database.connection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();