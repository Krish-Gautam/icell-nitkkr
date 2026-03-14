

import { Router } from "express";
import { getTeams } from "../controllers/teamController.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getTeams);

export default router;