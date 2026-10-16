import express from "express";
import bodyParser from "body-parser";

import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import courseRoutes from "./courseRoutes";
import courseStaffRoutes from "./courseStaffRoutes";
import sectionRoutes from "./sectionRoutes";
import lessonRoutes from "./lessonRoutes";
import orderRoutes from "./orderRoutes";
import enrollmentRoutes from "./enrollmentRoutes";
import reviewRoutes from "./reviewRoutes";
import progressRoutes from "./progressRoutes";
import quizRoutes from "./quizRoutes";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
router.use("/course", courseRoutes);
router.use("/", courseStaffRoutes);
router.use("/", sectionRoutes);
router.use("/", lessonRoutes);
router.use("/", orderRoutes);
router.use("/", enrollmentRoutes);
router.use("/", reviewRoutes);
router.use("/", progressRoutes);
router.use("/", quizRoutes);

export default router;
