import { Router } from "express";
import { QueryTypes } from "sequelize";
import { Database } from "../../config/dbInstance";

const healthRoutes = Router();

healthRoutes.get("/", async (_req, res) => {
  try {
    const rows = await Database.sequelize.query<{ time: Date }>(
      "SELECT NOW() AS time",
      { type: QueryTypes.SELECT }
    );
    res.json({ status: "ok", dbTime: rows[0].time });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "db error" });
  }
});

export default healthRoutes;